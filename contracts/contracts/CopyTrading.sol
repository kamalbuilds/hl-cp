// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ICopyTrading.sol";

/**
 * @title CopyTrading
 * @dev Main contract for copy trading functionality on HyperEVM
 * @notice Allows users to copy trades from verified traders with risk management
 */
contract CopyTrading is ICopyTrading, ReentrancyGuard, Ownable, Pausable {
    struct Trader {
        address trader;
        bool isVerified;
        uint256 totalVolume;
        uint256 totalTrades;
        uint256 followers;
        uint256 maxCopyAmount;
        uint256 feeRate; // in basis points (100 = 1%)
        mapping(address => bool) blockedCopiers;
    }

    struct CopySettings {
        address trader;
        uint256 allocation; // Percentage of portfolio (in basis points)
        uint256 maxPositionSize;
        uint256 stopLoss; // in basis points
        uint256 takeProfit; // in basis points
        bool isActive;
        uint256 riskMultiplier; // in basis points (10000 = 1x)
    }

    struct Position {
        uint256 id;
        address trader;
        address copier;
        string symbol;
        bool isLong;
        uint256 size;
        uint256 entryPrice;
        uint256 leverage;
        uint256 timestamp;
        bool isOpen;
        uint256 exitPrice;
        int256 pnl;
    }

    // State variables
    mapping(address => Trader) public traders;
    mapping(address => mapping(address => CopySettings)) public copySettings;
    mapping(address => uint256[]) public userPositions;
    mapping(uint256 => Position) public positions;
    mapping(address => uint256) public userBalances;

    uint256 public nextPositionId = 1;
    uint256 public platformFeeRate = 100; // 1% in basis points
    address public feeRecipient;
    uint256 public constant MAX_ALLOCATION = 5000; // 50% max allocation per trader
    uint256 public constant MAX_LEVERAGE = 10000; // 100x max leverage (in basis points)

    // Events
    event TraderRegistered(address indexed trader, uint256 feeRate);
    event TraderVerified(address indexed trader);
    event CopySettingsUpdated(address indexed copier, address indexed trader, uint256 allocation);
    event PositionOpened(uint256 indexed positionId, address indexed trader, address indexed copier);
    event PositionClosed(uint256 indexed positionId, int256 pnl);
    event TradeExecuted(address indexed trader, string symbol, bool isLong, uint256 size, uint256 price);
    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Register as a trader
     * @param _feeRate Fee rate in basis points (max 1000 = 10%)
     * @param _maxCopyAmount Maximum amount that can be copied per trade
     */
    function registerTrader(uint256 _feeRate, uint256 _maxCopyAmount) external {
        require(_feeRate <= 1000, "Fee rate too high");
        require(_maxCopyAmount > 0, "Invalid max copy amount");

        Trader storage trader = traders[msg.sender];
        trader.trader = msg.sender;
        trader.feeRate = _feeRate;
        trader.maxCopyAmount = _maxCopyAmount;

        emit TraderRegistered(msg.sender, _feeRate);
    }

    /**
     * @dev Verify a trader (only owner)
     * @param _trader Address of trader to verify
     */
    function verifyTrader(address _trader) external onlyOwner {
        require(traders[_trader].trader != address(0), "Trader not registered");
        traders[_trader].isVerified = true;
        emit TraderVerified(_trader);
    }

    /**
     * @dev Set copy settings for a trader
     * @param _trader Address of trader to copy
     * @param _allocation Allocation percentage in basis points
     * @param _maxPositionSize Maximum position size
     * @param _stopLoss Stop loss in basis points
     * @param _takeProfit Take profit in basis points
     * @param _riskMultiplier Risk multiplier in basis points
     */
    function setCopySettings(
        address _trader,
        uint256 _allocation,
        uint256 _maxPositionSize,
        uint256 _stopLoss,
        uint256 _takeProfit,
        uint256 _riskMultiplier
    ) external {
        require(traders[_trader].isVerified, "Trader not verified");
        require(_allocation <= MAX_ALLOCATION, "Allocation too high");
        require(_riskMultiplier <= 20000, "Risk multiplier too high"); // Max 2x
        require(!traders[_trader].blockedCopiers[msg.sender], "Blocked by trader");

        CopySettings storage settings = copySettings[msg.sender][_trader];
        settings.trader = _trader;
        settings.allocation = _allocation;
        settings.maxPositionSize = _maxPositionSize;
        settings.stopLoss = _stopLoss;
        settings.takeProfit = _takeProfit;
        settings.riskMultiplier = _riskMultiplier;
        settings.isActive = true;

        // Update follower count
        if (!settings.isActive) {
            traders[_trader].followers++;
        }

        emit CopySettingsUpdated(msg.sender, _trader, _allocation);
    }

    /**
     * @dev Execute a trade (called by verified traders)
     * @param _symbol Trading symbol
     * @param _isLong True for long, false for short
     * @param _size Position size
     * @param _price Entry price
     * @param _leverage Leverage amount
     */
    function executeTrade(
        string memory _symbol,
        bool _isLong,
        uint256 _size,
        uint256 _price,
        uint256 _leverage
    ) external whenNotPaused {
        require(traders[msg.sender].isVerified, "Not verified trader");
        require(_leverage <= MAX_LEVERAGE, "Leverage too high");
        require(_size > 0 && _price > 0, "Invalid parameters");

        // Update trader stats
        traders[msg.sender].totalTrades++;
        traders[msg.sender].totalVolume += _size * _price;

        // Copy trade to followers
        _copyTradeToFollowers(msg.sender, _symbol, _isLong, _size, _price, _leverage);

        emit TradeExecuted(msg.sender, _symbol, _isLong, _size, _price);
    }

    /**
     * @dev Close a position
     * @param _positionId Position ID to close
     * @param _exitPrice Exit price
     */
    function closePosition(uint256 _positionId, uint256 _exitPrice) external {
        Position storage position = positions[_positionId];
        require(position.copier == msg.sender || position.trader == msg.sender, "Not authorized");
        require(position.isOpen, "Position already closed");
        require(_exitPrice > 0, "Invalid exit price");

        position.isOpen = false;
        position.exitPrice = _exitPrice;

        // Calculate PnL
        int256 priceDiff = int256(_exitPrice) - int256(position.entryPrice);
        if (!position.isLong) {
            priceDiff = -priceDiff;
        }

        position.pnl = (priceDiff * int256(position.size)) / int256(position.entryPrice);

        // Update balances
        if (position.pnl > 0) {
            userBalances[position.copier] += uint256(position.pnl);

            // Pay fees to trader and platform
            uint256 traderFee = (uint256(position.pnl) * traders[position.trader].feeRate) / 10000;
            uint256 platformFee = (uint256(position.pnl) * platformFeeRate) / 10000;

            userBalances[position.trader] += traderFee;
            userBalances[feeRecipient] += platformFee;
            userBalances[position.copier] -= (traderFee + platformFee);
        } else if (position.pnl < 0) {
            uint256 loss = uint256(-position.pnl);
            require(userBalances[position.copier] >= loss, "Insufficient balance");
            userBalances[position.copier] -= loss;
        }

        emit PositionClosed(_positionId, position.pnl);
    }

    /**
     * @dev Deposit funds for copy trading
     */
    function deposit() external payable {
        require(msg.value > 0, "Invalid deposit amount");
        userBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw funds
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Invalid amount");
        require(userBalances[msg.sender] >= _amount, "Insufficient balance");

        userBalances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit FundsWithdrawn(msg.sender, _amount);
    }

    /**
     * @dev Internal function to copy trades to followers
     */
    function _copyTradeToFollowers(
        address _trader,
        string memory _symbol,
        bool _isLong,
        uint256 _size,
        uint256 _price,
        uint256 _leverage
    ) internal {
        // This would iterate through followers and create positions
        // For simplicity, we'll emit an event that the frontend can listen to
        // In a production system, you'd want to iterate through active followers

        // Example for one follower (this would be in a loop for all followers)
        // _createCopyPosition(follower, _trader, _symbol, _isLong, adjustedSize, _price, _leverage);
    }

    /**
     * @dev Create a copy position for a follower
     */
    function _createCopyPosition(
        address _copier,
        address _trader,
        string memory _symbol,
        bool _isLong,
        uint256 _size,
        uint256 _price,
        uint256 _leverage
    ) internal {
        CopySettings storage settings = copySettings[_copier][_trader];
        require(settings.isActive, "Copy settings not active");

        // Calculate position size based on allocation and risk multiplier
        uint256 copierBalance = userBalances[_copier];
        uint256 allocatedAmount = (copierBalance * settings.allocation) / 10000;
        uint256 adjustedSize = (allocatedAmount * settings.riskMultiplier) / 10000;

        // Apply position size limits
        if (adjustedSize > settings.maxPositionSize) {
            adjustedSize = settings.maxPositionSize;
        }

        require(adjustedSize > 0, "Invalid position size");
        require(copierBalance >= adjustedSize, "Insufficient balance");

        // Create position
        uint256 positionId = nextPositionId++;
        Position storage position = positions[positionId];
        position.id = positionId;
        position.trader = _trader;
        position.copier = _copier;
        position.symbol = _symbol;
        position.isLong = _isLong;
        position.size = adjustedSize;
        position.entryPrice = _price;
        position.leverage = _leverage;
        position.timestamp = block.timestamp;
        position.isOpen = true;

        userPositions[_copier].push(positionId);

        emit PositionOpened(positionId, _trader, _copier);
    }

    /**
     * @dev Get user's open positions
     * @param _user User address
     * @return Array of position IDs
     */
    function getUserPositions(address _user) external view returns (uint256[] memory) {
        return userPositions[_user];
    }

    /**
     * @dev Block a copier (trader only)
     * @param _copier Address to block
     */
    function blockCopier(address _copier) external {
        require(traders[msg.sender].trader == msg.sender, "Not a trader");
        traders[msg.sender].blockedCopiers[_copier] = true;
    }

    /**
     * @dev Emergency pause (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Update platform fee rate (owner only)
     * @param _newFeeRate New fee rate in basis points
     */
    function updatePlatformFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 500, "Fee rate too high"); // Max 5%
        platformFeeRate = _newFeeRate;
    }
}
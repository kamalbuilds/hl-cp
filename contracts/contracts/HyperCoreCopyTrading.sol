// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IL1Read.sol";
import "./interfaces/ICoreWriter.sol";

contract HyperCoreCopyTrading is Ownable, ReentrancyGuard, Pausable {
    // HyperCore precompile addresses
    address constant POSITION_PRECOMPILE = 0x0000000000000000000000000000000000000800;
    address constant SPOT_BALANCE_PRECOMPILE = 0x0000000000000000000000000000000000000801;
    address constant VAULT_EQUITY_PRECOMPILE = 0x0000000000000000000000000000000000000802;
    address constant WITHDRAWABLE_PRECOMPILE = 0x0000000000000000000000000000000000000803;
    address constant ORACLE_PX_PRECOMPILE = 0x0000000000000000000000000000000000000807;
    address constant BBO_PRECOMPILE = 0x000000000000000000000000000000000000080e;
    address constant MARGIN_SUMMARY_PRECOMPILE = 0x000000000000000000000000000000000000080F;

    // CoreWriter address for sending actions to HyperCore
    address constant CORE_WRITER = 0x3333333333333333333333333333333333333333;

    // Action IDs for CoreWriter
    uint8 constant ACTION_LIMIT_ORDER = 1;
    uint8 constant ACTION_VAULT_TRANSFER = 2;
    uint8 constant ACTION_USD_CLASS_TRANSFER = 7;
    uint8 constant ACTION_CANCEL_ORDER_BY_OID = 10;
    uint8 constant ACTION_CANCEL_ORDER_BY_CLOID = 11;

    struct Trader {
        bool isActive;
        string name;
        string bio;
        uint256 performanceFee; // in basis points (e.g., 2000 = 20%)
        uint256 minCopyAmount;
        uint256 maxCopyAmount;
        uint256 totalCopiers;
        uint256 totalVolume;
        int256 totalPnL;
        mapping(address => CopyPosition) copiers;
        address[] copierList;
        uint256 lastTradeTimestamp;
    }

    struct CopyPosition {
        bool isActive;
        uint256 allocatedAmount;
        uint256 leverage;
        bool copyPerps;
        bool copySpot;
        int256 unrealizedPnL;
        uint256 copiedSince;
    }

    struct Order {
        uint32 asset;
        bool isBuy;
        uint64 limitPx;
        uint64 size;
        bool reduceOnly;
        uint8 tif; // 1=ALO, 2=GTC, 3=IOC
        uint128 cloid;
        address trader;
        uint256 timestamp;
    }

    mapping(address => Trader) public traders;
    mapping(uint128 => Order) public orders;
    mapping(address => mapping(uint32 => IL1Read.Position)) public lastKnownPositions;

    address[] public allTraders;
    uint128 public nextCloid = 1;
    uint256 public platformFee = 100; // 1%
    address public feeRecipient;

    event TraderRegistered(address indexed trader, string name, uint256 performanceFee);
    event TraderUpdated(address indexed trader, string name, uint256 performanceFee);
    event CopyingStarted(address indexed copier, address indexed trader, uint256 amount, uint256 leverage);
    event CopyingStopped(address indexed copier, address indexed trader);
    event OrderPlaced(address indexed trader, uint128 cloid, uint32 asset, bool isBuy, uint64 size, uint64 price);
    event OrderCancelled(address indexed trader, uint128 cloid);
    event PositionCopied(address indexed copier, address indexed trader, uint32 asset, bool isBuy, uint64 size);
    event PnLRealized(address indexed trader, address indexed copier, int256 pnl, uint256 performanceFee);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    // ============ Trader Management ============

    function registerAsTrader(
        string calldata _name,
        string calldata _bio,
        uint256 _performanceFee,
        uint256 _minCopyAmount,
        uint256 _maxCopyAmount
    ) external {
        require(!traders[msg.sender].isActive, "Already registered");
        require(_performanceFee <= 5000, "Max fee is 50%");
        require(_minCopyAmount > 0 && _minCopyAmount < _maxCopyAmount, "Invalid copy amounts");

        Trader storage trader = traders[msg.sender];
        trader.isActive = true;
        trader.name = _name;
        trader.bio = _bio;
        trader.performanceFee = _performanceFee;
        trader.minCopyAmount = _minCopyAmount;
        trader.maxCopyAmount = _maxCopyAmount;

        allTraders.push(msg.sender);

        emit TraderRegistered(msg.sender, _name, _performanceFee);
    }

    // ============ Copy Trading ============

    function startCopying(
        address _trader,
        uint256 _leverage,
        bool _copyPerps,
        bool _copySpot
    ) external payable nonReentrant {
        require(traders[_trader].isActive, "Trader not active");
        require(msg.value >= traders[_trader].minCopyAmount, "Below min amount");
        require(msg.value <= traders[_trader].maxCopyAmount, "Above max amount");
        require(_leverage >= 1 && _leverage <= 50, "Invalid leverage");
        require(_copyPerps || _copySpot, "Must copy something");

        Trader storage trader = traders[_trader];
        require(!trader.copiers[msg.sender].isActive, "Already copying");

        CopyPosition storage position = trader.copiers[msg.sender];
        position.isActive = true;
        position.allocatedAmount = msg.value;
        position.leverage = _leverage;
        position.copyPerps = _copyPerps;
        position.copySpot = _copySpot;
        position.copiedSince = block.timestamp;

        trader.copierList.push(msg.sender);
        trader.totalCopiers++;

        emit CopyingStarted(msg.sender, _trader, msg.value, _leverage);
    }

    function stopCopying(address _trader) external nonReentrant {
        Trader storage trader = traders[_trader];
        CopyPosition storage position = trader.copiers[msg.sender];
        require(position.isActive, "Not copying this trader");

        // Calculate and distribute any unrealized PnL
        if (position.unrealizedPnL != 0) {
            _settlePnL(_trader, msg.sender);
        }

        // Return remaining allocated amount
        uint256 remainingAmount = position.allocatedAmount;
        position.isActive = false;
        position.allocatedAmount = 0;
        trader.totalCopiers--;

        if (remainingAmount > 0) {
            (bool success, ) = msg.sender.call{value: remainingAmount}("");
            require(success, "Transfer failed");
        }

        emit CopyingStopped(msg.sender, _trader);
    }

    // ============ HyperCore Trading Functions ============

    function placeLimitOrder(
        uint32 _asset,
        bool _isBuy,
        uint64 _limitPx,
        uint64 _sz,
        bool _reduceOnly,
        uint8 _tif
    ) external returns (uint128) {
        require(traders[msg.sender].isActive, "Not a trader");
        require(_tif >= 1 && _tif <= 3, "Invalid TIF");

        uint128 cloid = nextCloid++;

        // Create order record
        orders[cloid] = Order({
            asset: _asset,
            isBuy: _isBuy,
            limitPx: _limitPx,
            size: _sz,
            reduceOnly: _reduceOnly,
            tif: _tif,
            cloid: cloid,
            trader: msg.sender,
            timestamp: block.timestamp
        });

        // Encode the action for CoreWriter
        bytes memory encodedAction = abi.encode(_asset, _isBuy, _limitPx, _sz, _reduceOnly, _tif, cloid);
        bytes memory data = new bytes(4 + encodedAction.length);
        data[0] = 0x01; // Version
        data[1] = 0x00;
        data[2] = 0x00;
        data[3] = bytes1(ACTION_LIMIT_ORDER);
        for (uint256 i = 0; i < encodedAction.length; i++) {
            data[4 + i] = encodedAction[i];
        }

        // Send action to HyperCore
        ICoreWriter(CORE_WRITER).sendRawAction(data);

        // Copy trade for all copiers
        _copyTradeForCopiers(msg.sender, _asset, _isBuy, _limitPx, _sz, _reduceOnly, _tif);

        emit OrderPlaced(msg.sender, cloid, _asset, _isBuy, _sz, _limitPx);

        return cloid;
    }

    function cancelOrder(uint32 _asset, uint128 _cloid) external {
        Order memory order = orders[_cloid];
        require(order.trader == msg.sender, "Not your order");

        // Encode cancel action
        bytes memory encodedAction = abi.encode(_asset, _cloid);
        bytes memory data = new bytes(4 + encodedAction.length);
        data[0] = 0x01;
        data[1] = 0x00;
        data[2] = 0x00;
        data[3] = bytes1(ACTION_CANCEL_ORDER_BY_CLOID);
        for (uint256 i = 0; i < encodedAction.length; i++) {
            data[4 + i] = encodedAction[i];
        }

        ICoreWriter(CORE_WRITER).sendRawAction(data);

        delete orders[_cloid];
        emit OrderCancelled(msg.sender, _cloid);
    }

    function transferToVault(address _vault, bool _isDeposit, uint64 _usd) external {
        require(traders[msg.sender].isActive, "Not a trader");

        bytes memory encodedAction = abi.encode(_vault, _isDeposit, _usd);
        bytes memory data = new bytes(4 + encodedAction.length);
        data[0] = 0x01;
        data[1] = 0x00;
        data[2] = 0x00;
        data[3] = bytes1(ACTION_VAULT_TRANSFER);
        for (uint256 i = 0; i < encodedAction.length; i++) {
            data[4 + i] = encodedAction[i];
        }

        ICoreWriter(CORE_WRITER).sendRawAction(data);
    }

    // ============ Position Reading Functions ============

    function getTraderPosition(address _trader, uint16 _perp) external view returns (IL1Read.Position memory) {
        (bool success, bytes memory result) = POSITION_PRECOMPILE.staticcall(
            abi.encode(_trader, _perp)
        );
        require(success, "Failed to get position");
        return abi.decode(result, (IL1Read.Position));
    }

    function getOraclePrice(uint32 _index) external view returns (uint64) {
        (bool success, bytes memory result) = ORACLE_PX_PRECOMPILE.staticcall(
            abi.encode(_index)
        );
        require(success, "Failed to get oracle price");
        return abi.decode(result, (uint64));
    }

    function getBestBidOffer(uint32 _asset) external view returns (IL1Read.Bbo memory) {
        (bool success, bytes memory result) = BBO_PRECOMPILE.staticcall(
            abi.encode(_asset)
        );
        require(success, "Failed to get BBO");
        return abi.decode(result, (IL1Read.Bbo));
    }

    function getAccountMargin(uint32 _perpDexIndex, address _user)
        external view returns (IL1Read.AccountMarginSummary memory) {
        (bool success, bytes memory result) = MARGIN_SUMMARY_PRECOMPILE.staticcall(
            abi.encode(_perpDexIndex, _user)
        );
        require(success, "Failed to get margin summary");
        return abi.decode(result, (IL1Read.AccountMarginSummary));
    }

    // ============ Internal Functions ============

    function _copyTradeForCopiers(
        address _trader,
        uint32 _asset,
        bool _isBuy,
        uint64 _limitPx,
        uint64 _sz,
        bool _reduceOnly,
        uint8 _tif
    ) internal {
        Trader storage trader = traders[_trader];

        for (uint256 i = 0; i < trader.copierList.length; i++) {
            address copier = trader.copierList[i];
            CopyPosition storage position = trader.copiers[copier];

            if (!position.isActive || !position.copyPerps) continue;

            // Calculate proportional size based on leverage and allocation
            uint64 copierSize = uint64((_sz * position.leverage * position.allocatedAmount) /
                                      (trader.maxCopyAmount * 10));

            if (copierSize == 0) continue;

            // Generate unique cloid for copier
            uint128 copierCloid = nextCloid++;

            // Encode and send copier's order
            bytes memory encodedAction = abi.encode(
                _asset, _isBuy, _limitPx, copierSize, _reduceOnly, _tif, copierCloid
            );
            bytes memory data = new bytes(4 + encodedAction.length);
            data[0] = 0x01;
            data[1] = 0x00;
            data[2] = 0x00;
            data[3] = bytes1(ACTION_LIMIT_ORDER);
            for (uint256 j = 0; j < encodedAction.length; j++) {
                data[4 + j] = encodedAction[j];
            }

            // Use low-level call to handle potential failures gracefully
            (bool success, ) = CORE_WRITER.call(abi.encodeWithSignature("sendRawAction(bytes)", data));

            if (success) {
                emit PositionCopied(copier, _trader, _asset, _isBuy, copierSize);
            }
        }
    }

    function _settlePnL(address _trader, address _copier) internal {
        CopyPosition storage position = traders[_trader].copiers[_copier];
        int256 pnl = position.unrealizedPnL;

        if (pnl > 0) {
            // Calculate performance fee
            uint256 profit = uint256(pnl);
            uint256 performanceFee = (profit * traders[_trader].performanceFee) / 10000;
            uint256 platformFeeAmount = (profit * platformFee) / 10000;
            uint256 netProfit = profit - performanceFee - platformFeeAmount;

            // Update balances
            position.allocatedAmount += netProfit;

            // Transfer fees
            if (performanceFee > 0) {
                (bool success1, ) = _trader.call{value: performanceFee}("");
                require(success1, "Fee transfer failed");
            }

            if (platformFeeAmount > 0) {
                (bool success2, ) = feeRecipient.call{value: platformFeeAmount}("");
                require(success2, "Platform fee transfer failed");
            }

            emit PnLRealized(_trader, _copier, pnl, performanceFee);
        } else if (pnl < 0) {
            // Deduct loss from allocated amount
            uint256 loss = uint256(-pnl);
            if (loss >= position.allocatedAmount) {
                position.allocatedAmount = 0;
            } else {
                position.allocatedAmount -= loss;
            }

            emit PnLRealized(_trader, _copier, pnl, 0);
        }

        position.unrealizedPnL = 0;
    }

    // ============ View Functions ============

    function getTraderInfo(address _trader) external view returns (
        bool isActive,
        string memory name,
        string memory bio,
        uint256 performanceFee,
        uint256 totalCopiers,
        uint256 totalVolume,
        int256 totalPnL
    ) {
        Trader storage trader = traders[_trader];
        return (
            trader.isActive,
            trader.name,
            trader.bio,
            trader.performanceFee,
            trader.totalCopiers,
            trader.totalVolume,
            trader.totalPnL
        );
    }

    function getCopyPosition(address _trader, address _copier) external view returns (
        bool isActive,
        uint256 allocatedAmount,
        uint256 leverage,
        bool copyPerps,
        bool copySpot,
        int256 unrealizedPnL,
        uint256 copiedSince
    ) {
        CopyPosition storage position = traders[_trader].copiers[_copier];
        return (
            position.isActive,
            position.allocatedAmount,
            position.leverage,
            position.copyPerps,
            position.copySpot,
            position.unrealizedPnL,
            position.copiedSince
        );
    }

    function getAllTraders() external view returns (address[] memory) {
        return allTraders;
    }

    // ============ Admin Functions ============

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Max platform fee is 5%");
        platformFee = _fee;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
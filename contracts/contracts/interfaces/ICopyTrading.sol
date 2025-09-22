// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICopyTrading
 * @dev Interface for the copy trading contract
 */
interface ICopyTrading {
    /**
     * @dev Register as a trader
     * @param _feeRate Fee rate in basis points
     * @param _maxCopyAmount Maximum amount that can be copied per trade
     */
    function registerTrader(uint256 _feeRate, uint256 _maxCopyAmount) external;

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
    ) external;

    /**
     * @dev Execute a trade
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
    ) external;

    /**
     * @dev Close a position
     * @param _positionId Position ID to close
     * @param _exitPrice Exit price
     */
    function closePosition(uint256 _positionId, uint256 _exitPrice) external;

    /**
     * @dev Deposit funds for copy trading
     */
    function deposit() external payable;

    /**
     * @dev Withdraw funds
     * @param _amount Amount to withdraw
     */
    function withdraw(uint256 _amount) external;

    /**
     * @dev Get user's open positions
     * @param _user User address
     * @return Array of position IDs
     */
    function getUserPositions(address _user) external view returns (uint256[] memory);
}
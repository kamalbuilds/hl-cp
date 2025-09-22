// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICopyTrading
 * @dev Interface for the CopyTrading contract
 */
interface ICopyTrading {
    // Events
    event TraderRegistered(address indexed trader, uint256 feeRate, uint256 maxCopyAmount);
    event TraderUpdated(address indexed trader, uint256 feeRate, uint256 maxCopyAmount);
    event CopySettingsUpdated(address indexed follower, address indexed trader, uint256 allocation);
    event PositionOpened(uint256 indexed positionId, address indexed trader, address indexed follower, string symbol, bool isLong, uint256 size, uint256 price);
    event PositionClosed(uint256 indexed positionId, int256 pnl, uint256 closedPrice);
    event FeesCollected(address indexed trader, address indexed follower, uint256 amount);

    // Functions
    function registerTrader(uint256 _feeRate, uint256 _maxCopyAmount) external;
    function updateTraderSettings(uint256 _feeRate, uint256 _maxCopyAmount) external;
    function setCopySettings(
        address _trader,
        uint256 _allocation,
        uint256 _maxPositionSize,
        uint256 _stopLoss,
        uint256 _takeProfit,
        uint256 _riskMultiplier
    ) external payable;
    function executeTrade(
        string memory _symbol,
        bool _isLong,
        uint256 _size,
        uint256 _price,
        uint256 _leverage
    ) external;
    function closePosition(uint256 _positionId, uint256 _closePrice) external;
    function stopCopying(address _trader) external;
    function getTraderStats(address _trader) external view returns (
        uint256 feeRate,
        uint256 totalFollowers,
        uint256 totalVolume,
        int256 totalPnL,
        bool isActive
    );
    function getUserOpenPositions(address _user) external view returns (uint256[] memory);
    function getRegisteredTraders() external view returns (address[] memory);
}

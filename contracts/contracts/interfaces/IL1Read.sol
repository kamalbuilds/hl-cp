// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IL1Read {
  struct Position {
    int64 szi;
    uint64 entryNtl;
    int64 isolatedRawUsd;
    uint32 leverage;
    bool isIsolated;
  }

  struct SpotBalance {
    uint64 total;
    uint64 hold;
    uint64 entryNtl;
  }

  struct UserVaultEquity {
    uint64 equity;
    uint64 lockedUntilTimestamp;
  }

  struct Withdrawable {
    uint64 withdrawable;
  }

  struct AccountMarginSummary {
    int64 accountValue;
    uint64 marginUsed;
    uint64 ntlPos;
    int64 rawUsd;
  }

  struct Bbo {
    uint64 bid;
    uint64 ask;
  }

  function position(address user, uint16 perp) external view returns (Position memory);
  function spotBalance(address user, uint64 token) external view returns (SpotBalance memory);
  function userVaultEquity(address user, address vault) external view returns (UserVaultEquity memory);
  function withdrawable(address user) external view returns (Withdrawable memory);
  function markPx(uint32 index) external view returns (uint64);
  function oraclePx(uint32 index) external view returns (uint64);
  function spotPx(uint32 index) external view returns (uint64);
  function l1BlockNumber() external view returns (uint64);
  function bbo(uint32 asset) external view returns (Bbo memory);
  function accountMarginSummary(uint32 perp_dex_index, address user) external view returns (AccountMarginSummary memory);
}
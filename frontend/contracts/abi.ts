export const CopyTradingABI = [
  {
    inputs: [
      { internalType: 'address', name: '_feeRecipient', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'copier', type: 'address' },
      { indexed: true, internalType: 'address', name: 'trader', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'CopyingStarted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'copier', type: 'address' },
      { indexed: true, internalType: 'address', name: 'trader', type: 'address' }
    ],
    name: 'CopyingStopped',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'trader', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'positionId', type: 'uint256' },
      { indexed: false, internalType: 'int256', name: 'pnl', type: 'int256' }
    ],
    name: 'PositionClosed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'trader', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'positionId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'market', type: 'string' },
      { indexed: false, internalType: 'bool', name: 'isLong', type: 'bool' },
      { indexed: false, internalType: 'uint256', name: 'size', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'entryPrice', type: 'uint256' }
    ],
    name: 'PositionOpened',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'trader', type: 'address' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'string', name: 'bio', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'performanceFee', type: 'uint256' }
    ],
    name: 'TraderRegistered',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'positionId', type: 'uint256' },
      { internalType: 'int256', name: 'pnl', type: 'int256' }
    ],
    name: 'closePosition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'trader', type: 'address' }
    ],
    name: 'startCopying',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'trader', type: 'address' }
    ],
    name: 'stopCopying',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'market', type: 'string' },
      { internalType: 'bool', name: 'isLong', type: 'bool' },
      { internalType: 'uint256', name: 'size', type: 'uint256' },
      { internalType: 'uint256', name: 'entryPrice', type: 'uint256' }
    ],
    name: 'openPosition',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'bio', type: 'string' },
      { internalType: 'uint256', name: 'performanceFee', type: 'uint256' },
      { internalType: 'string', name: 'twitter', type: 'string' },
      { internalType: 'string', name: 'telegram', type: 'string' },
      { internalType: 'string', name: 'discord', type: 'string' }
    ],
    name: 'registerAsTrader',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'bio', type: 'string' },
      { internalType: 'uint256', name: 'performanceFee', type: 'uint256' },
      { internalType: 'uint256', name: 'minCopyAmount', type: 'uint256' },
      { internalType: 'uint256', name: 'maxCopyAmount', type: 'uint256' },
      { internalType: 'string', name: 'twitter', type: 'string' },
      { internalType: 'string', name: 'telegram', type: 'string' },
      { internalType: 'string', name: 'discord', type: 'string' }
    ],
    name: 'updateTraderSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'trader', type: 'address' }
    ],
    name: 'getTraderInfo',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'bio', type: 'string' },
          { internalType: 'uint256', name: 'performanceFee', type: 'uint256' },
          { internalType: 'uint256', name: 'totalCopiers', type: 'uint256' },
          { internalType: 'uint256', name: 'totalProfit', type: 'uint256' },
          { internalType: 'uint256', name: 'totalLoss', type: 'uint256' },
          { internalType: 'uint256', name: 'minCopyAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'maxCopyAmount', type: 'uint256' },
          { internalType: 'string', name: 'twitter', type: 'string' },
          { internalType: 'string', name: 'telegram', type: 'string' },
          { internalType: 'string', name: 'discord', type: 'string' }
        ],
        internalType: 'struct ICopyTrading.TraderInfo',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'trader', type: 'address' }
    ],
    name: 'getTraderStats',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'totalTrades', type: 'uint256' },
          { internalType: 'uint256', name: 'winningTrades', type: 'uint256' },
          { internalType: 'uint256', name: 'totalProfitGenerated', type: 'uint256' },
          { internalType: 'uint256', name: 'totalFeesEarned', type: 'uint256' },
          { internalType: 'uint256', name: 'avgWinAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'avgLossAmount', type: 'uint256' },
          { internalType: 'uint256', name: 'lastTradeTimestamp', type: 'uint256' }
        ],
        internalType: 'struct ICopyTrading.TraderStats',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllTraders',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'trader', type: 'address' }
    ],
    name: 'getCopiers',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;
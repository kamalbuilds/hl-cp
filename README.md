# HyperMirror - Mirror the Masters, Multiply Your Success

## Overview
Revolutionary cross-chain copy trading platform built on HyperEVM with direct HyperCore integration for real perpetual trading on Hyperliquid L1.

## Key Features

### 🚀 HyperCore Integration
- Direct L1 perpetual trading through CoreWriter contract at 0x3333333333333333333333333333333333333333
- Real-time position tracking via L1Read precompiles
- Oracle price feeds from address 0x0000000000000000000000000000000000000807
- Best bid/offer data from address 0x000000000000000000000000000000000000080e
- Account margin tracking from address 0x000000000000000000000000000000000000080F
- Sub-second order execution with ~25k gas cost

### 💫 Copy Trading Features
- Automated position mirroring for all copiers
- Proportional sizing based on leverage (1x-50x)
- Performance fee system (0-50% of profits)
- Real-time PnL calculation and settlement
- Risk management controls (reduce-only, TIF options)

### 🌉 Cross-Chain Bridge
- deBridge integration for seamless onboarding
- Support for Ethereum, Arbitrum, Optimism, Polygon, BSC
- One-click bridging to HyperEVM (Chain ID 999)

### 📊 Trading Interface
- Live oracle prices with 1-second updates
- Real-time position monitoring
- Advanced order types (Limit, Market, IOC, GTC, ALO)
- Margin ratio tracking with visual indicators
- Quick trade buttons and leverage slider

### 👥 Social Trading
- Trader profiles with performance metrics
- Win rate and ROI tracking
- Social links (Twitter, Telegram, Discord)
- Leaderboard with filtering and sorting
- Follower dashboard with portfolio tracking

## Tech Stack

### Smart Contracts
- Solidity 0.8.20
- OpenZeppelin security contracts
- HyperCore precompile integration
- CoreWriter for L1 actions

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Wagmi v2 for Web3 integration
- RainbowKit for wallet connection
- TailwindCSS for styling
- React Hot Toast for notifications

### Infrastructure
- HyperEVM (Chain ID 998/999)
- Hardhat development environment
- deBridge cross-chain protocol

## Contract Addresses

### Testnet (Chain ID 998)
- CopyTrading: [To be deployed]
- HyperCoreCopyTrading: [To be deployed]

### Mainnet (Chain ID 999)
- CopyTrading: [To be deployed]
- HyperCoreCopyTrading: [To be deployed]

## 📁 Project Structure

```
hyperliquid-copy-trading/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── trader/         # Trader-related components
│   │   ├── portfolio/      # Portfolio components
│   │   └── trading/        # Trading-specific components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Next.js pages and API routes
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and constants
│   └── styles/             # Global styles
├── contracts/              # Smart contracts
│   ├── src/               # Contract source files
│   ├── interfaces/        # Contract interfaces
│   └── test/              # Contract tests
├── scripts/               # Deployment and utility scripts
├── tests/                 # Frontend tests
├── docs/                  # Documentation
└── config/                # Configuration files
```

## Getting Started

### Prerequisites
- Node.js 18+
- Bun or npm
- MetaMask or compatible wallet

### Installation

1. Clone the repository
2. Install dependencies:
```bash
# Contracts
cd contracts
npm install

# Frontend
cd ../frontend
bun install
```

3. Configure environment:
```bash
# Copy example env files
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env
```

4. Deploy contracts:
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network hyperevm
```

5. Start frontend:
```bash
cd frontend
bun run dev
```

## Architecture

### System Components
1. **HyperCore Layer**: Direct L1 integration for trading
2. **Smart Contract Layer**: Copy trading logic and fee management
3. **Frontend Layer**: React-based trading interface
4. **Bridge Layer**: deBridge for cross-chain transfers

### Data Flow
1. Trader places order via HyperCore
2. CoreWriter sends action to L1
3. Copy contract mirrors to all copiers
4. L1Read precompiles track positions
5. Frontend displays real-time updates

## HyperCore Action Types

| Action ID | Description | Gas Cost |
|-----------|-------------|----------|
| 1 | Limit Order | ~47k |
| 2 | Vault Transfer | ~30k |
| 7 | USD Class Transfer | ~25k |
| 10 | Cancel by OID | ~25k |
| 11 | Cancel by CLOID | ~25k |

## API Endpoints

### HyperEVM RPC
- Testnet: https://rpc.hyperliquid-testnet.xyz/evm
- Mainnet: https://rpc.hyperevm.xyz/evm

### WebSocket
- Testnet: wss://api.hyperliquid-testnet.xyz/ws
- Mainnet: wss://api.hyperliquid.xyz/ws

## 📖 Usage Guide

### For Copiers (Followers)

1. **Connect Wallet**: Connect your MetaMask or compatible wallet
2. **Bridge Assets**: Use the deBridge widget to transfer assets to HyperEVM
3. **Discover Traders**: Browse the trader leaderboard and filter by metrics
4. **Follow Traders**: Set up copy trading with custom risk parameters
5. **Monitor Portfolio**: Track your positions and performance in real-time

### For Traders (Leaders)

1. **Register as Trader**: Submit your wallet address for verification
2. **Set Fee Structure**: Configure your performance fee rates
3. **Trade on Hyperliquid**: Execute trades that will be copied by followers
4. **Build Reputation**: Maintain consistent performance to attract more copiers

### Risk Management Features

- **Position Sizing**: Set maximum position sizes per trade
- **Stop Loss/Take Profit**: Automatic exit points for risk control
- **Portfolio Allocation**: Limit exposure to individual traders
- **Risk Multiplier**: Scale trade sizes based on risk appetite

## 🔧 Smart Contract Architecture

### CopyTrading Contract Features

- **Trader Registration**: On-chain verification system
- **Copy Settings Management**: Customizable copy parameters per follower
- **Automatic Position Creation**: Real-time trade mirroring
- **Fee Distribution**: Transparent fee collection and distribution
- **Risk Controls**: Built-in safety mechanisms and limits

### Key Functions

```solidity
// Register as a trader
function registerTrader(uint256 _feeRate, uint256 _maxCopyAmount) external

// Set copy settings for a trader
function setCopySettings(
    address _trader,
    uint256 _allocation,
    uint256 _maxPositionSize,
    uint256 _stopLoss,
    uint256 _takeProfit,
    uint256 _riskMultiplier
) external

// Execute a trade (traders only)
function executeTrade(
    string memory _symbol,
    bool _isLong,
    uint256 _size,
    uint256 _price,
    uint256 _leverage
) external
```

## 🌐 API Endpoints

### Trader Management
- `GET /api/traders` - List all traders with filtering
- `GET /api/traders/[id]` - Get trader details
- `POST /api/traders` - Register new trader

### Portfolio & Positions
- `GET /api/portfolio/[address]` - Get user portfolio
- `GET /api/positions` - List user positions
- `POST /api/copy-trade` - Execute copy trade

### Analytics
- `GET /api/leaderboard` - Trader leaderboard
- `GET /api/bridge/quote` - Get bridge quotes

## 🔄 Real-time Features

### WebSocket Events

```javascript
// Trade execution
{
  type: 'trade',
  data: {
    trader_id: '1',
    symbol: 'BTC-USD',
    side: 'long',
    size: 10000,
    price: 43250
  }
}

// Position updates
{
  type: 'position_update',
  data: {
    id: 'pos_1',
    unrealized_pnl: 1550,
    current_price: 44800
  }
}
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test
npm run test:watch
```

### Smart Contract Tests
```bash
npm run contracts:test
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
npm run build
vercel deploy
```

### Smart Contract Deployment
```bash
# Deploy to HyperEVM testnet
npm run contracts:deploy -- --network hyperevm

# Verify contracts
npm run contracts:verify
```

## Security

- ReentrancyGuard on all state-changing functions
- Pausable contract for emergency stops
- Owner-only admin functions
- Performance fee caps (max 50%)
- Reduce-only order support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License
MIT

## Team
Built for Hyperliquid Hackathon 2024 - deBridge Track

## Links
- [Demo Video](#)
- [Documentation](#)
- [Twitter](#)
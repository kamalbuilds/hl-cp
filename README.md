# Hyperliquid Copy Trading Platform

A comprehensive cross-chain copy trading platform built for the Hyperliquid hackathon. 

This platform enables users to discover, follow, and automatically copy trades from verified traders on HyperEVM with advanced risk management and cross-chain asset bridging.

## 🚀 Features

### Core Functionality
- **Real-time Copy Trading**: Automatically mirror trades from verified traders with customizable settings
- **Cross-chain Bridging**: Seamless asset bridging from multiple chains to HyperEVM using deBridge
- **Advanced Risk Management**: Stop-loss, take-profit, position sizing, and portfolio allocation controls
- **Trader Discovery**: Browse and filter traders by performance metrics, risk levels, and strategies
- **Portfolio Tracking**: Real-time portfolio overview with P&L tracking and risk analytics

### Smart Contracts (HyperEVM)
- **CopyTrading.sol**: Main contract for copy trading functionality
- **Trader Registration**: On-chain trader verification and fee management
- **Position Management**: Automated position creation and closure
- **Risk Controls**: Built-in risk limits and safety mechanisms

### Frontend Components
- **Wallet Integration**: MetaMask, WalletConnect, and RainbowKit support
- **Responsive UI**: Mobile-first design with dark mode support
- **Real-time Updates**: WebSocket integration for live trade data
- **Interactive Charts**: Portfolio performance and trader analytics

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: HyperEVM, Arbitrum, Ethereum
- **Wallet**: Wagmi, RainbowKit, Viem
- **Smart Contracts**: Solidity 0.8.19, Hardhat
- **Bridge**: deBridge Widget/API
- **Real-time**: WebSocket, Socket.io
- **UI Components**: Headless UI, Heroicons, Lucide React

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kamalbuilds/hl-cp
cd hl-cp
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start development server**
```bash
npm run dev
```

5. **Deploy smart contracts (optional)**
```bash
npm run contracts:compile
npm run contracts:deploy
```

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

## 🛡 Security Considerations

- **Smart Contract Audits**: Contracts should be audited before mainnet deployment
- **Private Key Management**: Never commit private keys to version control
- **Rate Limiting**: API endpoints should implement rate limiting
- **Input Validation**: All user inputs are validated and sanitized
- **Access Controls**: Proper role-based access control implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/hyperliquid-copy-trading/issues)
- **Discord**: [Community Discord](https://discord.gg/your-server)

## 🏆 Hackathon Submission

This project was built for the Hyperliquid hackathon, focusing on:
- Cross-chain interoperability with deBridge integration
- Real-time copy trading on HyperEVM
- Advanced risk management features
- User-friendly interface for DeFi adoption

### Demo Links
- **Live Demo**: [hyperliquid-copy-trading.vercel.app](https://hyperliquid-copy-trading.vercel.app)
- **Video Demo**: [YouTube Demo](https://youtube.com/watch?v=demo)
- **Contract on HyperEVM**: [Explorer Link](https://explorer.hyperliquid-testnet.xyz)

---

Built with ❤️ for the Hyperliquid ecosystem
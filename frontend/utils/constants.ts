// Contract addresses (will be updated after deployment)
export const CONTRACTS = {
  COPY_TRADING: process.env.NEXT_PUBLIC_COPY_TRADING_ADDRESS || "0x...",
} as const;

// Chain configurations
export const SUPPORTED_CHAINS = {
  HYPEREVM: {
    id: 998,
    name: "HyperEVM",
    rpcUrl: "https://rpc.hyperliquid-testnet.xyz/evm",
    blockExplorer: "https://explorer.hyperliquid-testnet.xyz",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
  ARBITRUM: {
    id: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

// deBridge configuration
export const DEBRIDGE_CONFIG = {
  API_URL: "https://api.dln.trade/v1.0",
  WIDGET_URL: "https://app.dln.trade",
  SUPPORTED_CHAINS: [1, 10, 56, 137, 8453, 42161, 43114], // ETH, OP, BSC, POLYGON, BASE, ARB, AVAX
} as const;

// Trading symbols supported on Hyperliquid
export const TRADING_SYMBOLS = [
  "BTC-USD",
  "ETH-USD",
  "SOL-USD",
  "AVAX-USD",
  "MATIC-USD",
  "LINK-USD",
  "UNI-USD",
  "AAVE-USD",
  "ATOM-USD",
  "DOT-USD",
] as const;

// Risk management constants
export const RISK_LIMITS = {
  MAX_ALLOCATION_PER_TRADER: 5000, // 50% in basis points
  MAX_LEVERAGE: 10000, // 100x in basis points
  MAX_TRADER_FEE: 1000, // 10% in basis points
  MAX_PLATFORM_FEE: 500, // 5% in basis points
  MIN_DEPOSIT: "0.01", // ETH
  MAX_RISK_MULTIPLIER: 20000, // 2x in basis points
} as const;

// WebSocket configuration
export const WS_CONFIG = {
  URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://api.hyperliquid-testnet.xyz/ws",
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  TRADERS: "/api/traders",
  POSITIONS: "/api/positions",
  TRADES: "/api/trades",
  PORTFOLIO: "/api/portfolio",
  LEADERBOARD: "/api/leaderboard",
  BRIDGE_QUOTE: "/api/bridge/quote",
} as const;

// UI constants
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 20,
  CHART_REFRESH_INTERVAL: 5000,
  PRICE_UPDATE_INTERVAL: 1000,
  LEADERBOARD_REFRESH_INTERVAL: 30000,
} as const;
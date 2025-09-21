export interface Trader {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
  totalPnL: number;
  winRate: number;
  followers: number;
  copiers: number;
  maxDrawdown: number;
  sharpeRatio: number;
  avgPositionSize: number;
  totalTrades: number;
  isVerified: boolean;
  riskScore: number;
  strategies: string[];
  performanceHistory: PerformanceData[];
}

export interface PerformanceData {
  timestamp: number;
  pnl: number;
  cumulativePnL: number;
  drawdown: number;
  volume: number;
}

export interface Position {
  id: string;
  traderId: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  leverage: number;
  timestamp: number;
  status: 'open' | 'closed';
  exitPrice?: number;
  realizedPnL?: number;
}

export interface CopyTradeSettings {
  traderId: string;
  allocation: number; // Percentage of portfolio to allocate
  maxPositionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  enabledSymbols: string[];
  riskMultiplier: number;
  autoRebalance: boolean;
}

export interface Portfolio {
  totalValue: number;
  availableBalance: number;
  unrealizedPnL: number;
  realizedPnL: number;
  positions: Position[];
  allocations: CopyTradeSettings[];
  riskMetrics: RiskMetrics;
}

export interface RiskMetrics {
  currentDrawdown: number;
  maxDrawdown: number;
  sharpeRatio: number;
  volatility: number;
  var95: number; // Value at Risk 95%
  exposureByAsset: Record<string, number>;
  exposureByTrader: Record<string, number>;
}

export interface Trade {
  id: string;
  traderId: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  price: number;
  timestamp: number;
  type: 'market' | 'limit';
  status: 'pending' | 'filled' | 'cancelled';
}

export interface ChainAsset {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  logoURI?: string;
}

export interface BridgeQuote {
  srcChainId: number;
  dstChainId: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: string;
  estimatedTime: number;
  fees: {
    protocol: string;
    bridge: string;
    gas: string;
  };
}
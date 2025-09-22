import { NextApiRequest, NextApiResponse } from 'next';
import { Portfolio, Position, CopyTradeSettings, RiskMetrics } from '@/types';

// Mock portfolio data
const mockPortfolios: Record<string, Portfolio> = {
  '0x1234567890123456789012345678901234567890': {
    totalValue: 125000,
    availableBalance: 45000,
    unrealizedPnL: 8500,
    realizedPnL: 12300,
    positions: [
      {
        id: 'pos_1',
        traderId: '1',
        symbol: 'BTC-USD',
        side: 'long',
        size: 25000,
        entryPrice: 43250,
        currentPrice: 44800,
        unrealizedPnL: 1550,
        leverage: 2,
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        status: 'open',
      },
      {
        id: 'pos_2',
        traderId: '2',
        symbol: 'ETH-USD',
        side: 'long',
        size: 15000,
        entryPrice: 2650,
        currentPrice: 2720,
        unrealizedPnL: 1050,
        leverage: 3,
        timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        status: 'open',
      },
      {
        id: 'pos_3',
        traderId: '1',
        symbol: 'SOL-USD',
        side: 'short',
        size: 8000,
        entryPrice: 85.5,
        currentPrice: 82.3,
        unrealizedPnL: 320,
        leverage: 2.5,
        timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        status: 'open',
      },
    ],
    allocations: [
      {
        traderId: '1',
        allocation: 4000, // 40%
        maxPositionSize: 30000,
        stopLoss: 500, // 5%
        takeProfit: 1500, // 15%
        enabledSymbols: ['BTC-USD', 'ETH-USD', 'SOL-USD'],
        riskMultiplier: 10000, // 1x
        autoRebalance: true,
        isActive: true,
      },
      {
        traderId: '2',
        allocation: 2500, // 25%
        maxPositionSize: 20000,
        stopLoss: 300, // 3%
        takeProfit: 1000, // 10%
        enabledSymbols: ['ETH-USD', 'AVAX-USD'],
        riskMultiplier: 8000, // 0.8x
        autoRebalance: false,
        isActive: false,
      },
    ],
    riskMetrics: {
      currentDrawdown: -2.3,
      maxDrawdown: -8.7,
      sharpeRatio: 1.8,
      volatility: 15.6,
      var95: -5200, // 95% VaR
      exposureByAsset: {
        'BTC-USD': 25000,
        'ETH-USD': 15000,
        'SOL-USD': 8000,
      },
      exposureByTrader: {
        '1': 33000,
        '2': 15000,
      },
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Invalid address' });
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetPortfolio(req, res, address);
        break;
      case 'PUT':
        await handleUpdatePortfolio(req, res, address);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Portfolio API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetPortfolio(req: NextApiRequest, res: NextApiResponse, address: string) {
  const portfolio = mockPortfolios[address];

  if (!portfolio) {
    // Return empty portfolio for new users
    const emptyPortfolio: Portfolio = {
      totalValue: 0,
      availableBalance: 0,
      unrealizedPnL: 0,
      realizedPnL: 0,
      positions: [],
      allocations: [],
      riskMetrics: {
        currentDrawdown: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        volatility: 0,
        var95: 0,
        exposureByAsset: {},
        exposureByTrader: {},
      },
    };

    return res.status(200).json({ portfolio: emptyPortfolio });
  }

  // Calculate real-time metrics
  const updatedPortfolio = {
    ...portfolio,
    // Add any real-time calculations here
  };

  res.status(200).json({ portfolio: updatedPortfolio });
}

async function handleUpdatePortfolio(req: NextApiRequest, res: NextApiResponse, address: string) {
  const { allocations, riskSettings } = req.body;

  if (!mockPortfolios[address]) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  // Update allocations
  if (allocations) {
    mockPortfolios[address].allocations = allocations;
  }

  // Update risk settings
  if (riskSettings) {
    // Apply risk settings updates
    mockPortfolios[address] = {
      ...mockPortfolios[address],
      ...riskSettings,
    };
  }

  res.status(200).json({ portfolio: mockPortfolios[address] });
}
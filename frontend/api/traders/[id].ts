import { NextApiRequest, NextApiResponse } from 'next';
import { Trader } from '@/types';

// This would come from a database in production
const mockTraders: Trader[] = [
  {
    id: '1',
    address: '0x1234567890123456789012345678901234567890',
    username: 'CryptoWhale',
    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=CryptoWhale',
    totalPnL: 156.7,
    winRate: 78.4,
    followers: 1250,
    copiers: 89,
    maxDrawdown: -12.3,
    sharpeRatio: 2.1,
    avgPositionSize: 50000,
    totalTrades: 234,
    isVerified: true,
    riskScore: 4,
    strategies: ['Trend Following', 'Mean Reversion', 'Momentum'],
    performanceHistory: Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() - (30 - i) * 24 * 60 * 60 * 1000,
      pnl: Math.random() * 20 - 5, // Random PnL between -5 and 15
      cumulativePnL: 156.7 - Math.random() * 50,
      drawdown: -Math.random() * 15,
      volume: Math.random() * 200000 + 50000,
    })),
  },
  // Add more mock traders as needed
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid trader ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetTrader(req, res, id);
        break;
      case 'PUT':
        await handleUpdateTrader(req, res, id);
        break;
      case 'DELETE':
        await handleDeleteTrader(req, res, id);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetTrader(req: NextApiRequest, res: NextApiResponse, id: string) {
  const trader = mockTraders.find(t => t.id === id);

  if (!trader) {
    return res.status(404).json({ error: 'Trader not found' });
  }

  res.status(200).json({ trader });
}

async function handleUpdateTrader(req: NextApiRequest, res: NextApiResponse, id: string) {
  const traderIndex = mockTraders.findIndex(t => t.id === id);

  if (traderIndex === -1) {
    return res.status(404).json({ error: 'Trader not found' });
  }

  const { username, strategies, maxCopyAmount, feeRate } = req.body;

  // Update trader data
  const updatedTrader = {
    ...mockTraders[traderIndex],
    ...(username && { username }),
    ...(strategies && { strategies }),
    // Add any other updatable fields
  };

  mockTraders[traderIndex] = updatedTrader;

  res.status(200).json({ trader: updatedTrader });
}

async function handleDeleteTrader(req: NextApiRequest, res: NextApiResponse, id: string) {
  const traderIndex = mockTraders.findIndex(t => t.id === id);

  if (traderIndex === -1) {
    return res.status(404).json({ error: 'Trader not found' });
  }

  mockTraders.splice(traderIndex, 1);
  res.status(204).end();
}
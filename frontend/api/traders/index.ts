import { NextApiRequest, NextApiResponse } from 'next';
import { Trader } from '@/types';

// Mock data for development - replace with actual database queries
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
    performanceHistory: [
      { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, pnl: 12.5, cumulativePnL: 144.2, drawdown: -2.1, volume: 125000 },
      { timestamp: Date.now() - 29 * 24 * 60 * 60 * 1000, pnl: 8.3, cumulativePnL: 152.5, drawdown: -1.2, volume: 89000 },
      { timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000, pnl: -3.2, cumulativePnL: 149.3, drawdown: -4.4, volume: 67000 },
      { timestamp: Date.now() - 27 * 24 * 60 * 60 * 1000, pnl: 7.4, cumulativePnL: 156.7, drawdown: -1.8, volume: 112000 },
    ],
  },
  {
    id: '2',
    address: '0x2345678901234567890123456789012345678901',
    username: 'DeFiMaster',
    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=DeFiMaster',
    totalPnL: 89.3,
    winRate: 65.2,
    followers: 890,
    copiers: 45,
    maxDrawdown: -18.7,
    sharpeRatio: 1.6,
    avgPositionSize: 25000,
    totalTrades: 156,
    isVerified: true,
    riskScore: 6,
    strategies: ['Arbitrage', 'Yield Farming'],
    performanceHistory: [
      { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, pnl: 5.2, cumulativePnL: 84.1, drawdown: -3.2, volume: 78000 },
      { timestamp: Date.now() - 29 * 24 * 60 * 60 * 1000, pnl: 3.1, cumulativePnL: 87.2, drawdown: -2.1, volume: 65000 },
      { timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000, pnl: 2.1, cumulativePnL: 89.3, drawdown: -1.5, volume: 52000 },
    ],
  },
  {
    id: '3',
    address: '0x3456789012345678901234567890123456789012',
    username: 'AlgoTrader',
    totalPnL: -15.6,
    winRate: 45.8,
    followers: 234,
    copiers: 12,
    maxDrawdown: -32.1,
    sharpeRatio: 0.8,
    avgPositionSize: 15000,
    totalTrades: 89,
    isVerified: false,
    riskScore: 8,
    strategies: ['Scalping', 'High Frequency'],
    performanceHistory: [
      { timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, pnl: -8.2, cumulativePnL: -7.4, drawdown: -15.6, volume: 45000 },
      { timestamp: Date.now() - 29 * 24 * 60 * 60 * 1000, pnl: -5.1, cumulativePnL: -12.5, drawdown: -20.7, volume: 38000 },
      { timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000, pnl: -3.1, cumulativePnL: -15.6, drawdown: -23.8, volume: 29000 },
    ],
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGetTraders(req, res);
        break;
      case 'POST':
        await handleCreateTrader(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetTraders(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = '1',
    limit = '20',
    sortBy = 'totalPnL',
    sortOrder = 'desc',
    riskLevel,
    minWinRate,
    verified,
    search,
  } = req.query;

  let traders = [...mockTraders];

  // Apply filters
  if (riskLevel) {
    const riskFilter = riskLevel as string;
    traders = traders.filter(trader => {
      if (riskFilter === 'low') return trader.riskScore <= 3;
      if (riskFilter === 'medium') return trader.riskScore > 3 && trader.riskScore <= 6;
      if (riskFilter === 'high') return trader.riskScore > 6;
      return true;
    });
  }

  if (minWinRate) {
    const minRate = parseFloat(minWinRate as string);
    traders = traders.filter(trader => trader.winRate >= minRate);
  }

  if (verified === 'true') {
    traders = traders.filter(trader => trader.isVerified);
  }

  if (search) {
    const searchTerm = (search as string).toLowerCase();
    traders = traders.filter(trader =>
      trader.username?.toLowerCase().includes(searchTerm) ||
      trader.address.toLowerCase().includes(searchTerm) ||
      trader.strategies.some(strategy => strategy.toLowerCase().includes(searchTerm))
    );
  }

  // Apply sorting
  const sortField = sortBy as keyof Trader;
  traders.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'desc'
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    }

    return 0;
  });

  // Apply pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedTraders = traders.slice(startIndex, endIndex);

  res.status(200).json({
    traders: paginatedTraders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: traders.length,
      totalPages: Math.ceil(traders.length / limitNum),
    },
  });
}

async function handleCreateTrader(req: NextApiRequest, res: NextApiResponse) {
  const { address, username, strategies } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  // Check if trader already exists
  const existingTrader = mockTraders.find(trader => trader.address === address);
  if (existingTrader) {
    return res.status(409).json({ error: 'Trader already exists' });
  }

  // Create new trader
  const newTrader: Trader = {
    id: Date.now().toString(),
    address,
    username: username || undefined,
    totalPnL: 0,
    winRate: 0,
    followers: 0,
    copiers: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    avgPositionSize: 0,
    totalTrades: 0,
    isVerified: false,
    riskScore: 5,
    strategies: strategies || [],
    performanceHistory: [],
  };

  mockTraders.push(newTrader);

  res.status(201).json({ trader: newTrader });
}
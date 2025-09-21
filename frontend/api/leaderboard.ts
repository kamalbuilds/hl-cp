import { NextApiRequest, NextApiResponse } from 'next';
import { Trader } from '@/types';

// Extended mock data for leaderboard
const mockLeaderboardData = {
  daily: [
    {
      id: '1',
      address: '0x1234567890123456789012345678901234567890',
      username: 'CryptoWhale',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=CryptoWhale',
      pnl: 12.5,
      volume: 145000,
      trades: 23,
      winRate: 82.6,
      isVerified: true,
      rank: 1,
      rankChange: 2, // moved up 2 positions
    },
    {
      id: '2',
      address: '0x2345678901234567890123456789012345678901',
      username: 'DeFiMaster',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=DeFiMaster',
      pnl: 8.7,
      volume: 89000,
      trades: 15,
      winRate: 73.3,
      isVerified: true,
      rank: 2,
      rankChange: -1, // moved down 1 position
    },
    {
      id: '4',
      address: '0x4567890123456789012345678901234567890123',
      username: 'FlashTrader',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=FlashTrader',
      pnl: 6.2,
      volume: 67000,
      trades: 45,
      winRate: 68.9,
      isVerified: false,
      rank: 3,
      rankChange: 5, // moved up 5 positions
    },
  ],
  weekly: [
    {
      id: '1',
      address: '0x1234567890123456789012345678901234567890',
      username: 'CryptoWhale',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=CryptoWhale',
      pnl: 78.3,
      volume: 950000,
      trades: 156,
      winRate: 79.5,
      isVerified: true,
      rank: 1,
      rankChange: 0,
    },
    {
      id: '5',
      address: '0x5678901234567890123456789012345678901234',
      username: 'YieldHunter',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=YieldHunter',
      pnl: 45.6,
      volume: 560000,
      trades: 89,
      winRate: 71.9,
      isVerified: true,
      rank: 2,
      rankChange: 3,
    },
    {
      id: '2',
      address: '0x2345678901234567890123456789012345678901',
      username: 'DeFiMaster',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=DeFiMaster',
      pnl: 34.2,
      volume: 420000,
      trades: 67,
      winRate: 67.2,
      isVerified: true,
      rank: 3,
      rankChange: -2,
    },
  ],
  monthly: [
    {
      id: '1',
      address: '0x1234567890123456789012345678901234567890',
      username: 'CryptoWhale',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=CryptoWhale',
      pnl: 156.7,
      volume: 3200000,
      trades: 534,
      winRate: 78.4,
      isVerified: true,
      rank: 1,
      rankChange: 0,
    },
    {
      id: '6',
      address: '0x6789012345678901234567890123456789012345',
      username: 'QuantBot',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=QuantBot',
      pnl: 123.4,
      volume: 2800000,
      trades: 789,
      winRate: 72.1,
      isVerified: true,
      rank: 2,
      rankChange: 1,
    },
    {
      id: '7',
      address: '0x7890123456789012345678901234567890123456',
      username: 'TrendSurfer',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=TrendSurfer',
      pnl: 98.9,
      volume: 2100000,
      trades: 345,
      winRate: 75.7,
      isVerified: false,
      rank: 3,
      rankChange: -1,
    },
  ],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      period = 'daily',
      limit = '50',
      metric = 'pnl',
      verified,
    } = req.query;

    // Validate period
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period as string)) {
      return res.status(400).json({ error: 'Invalid period. Must be daily, weekly, or monthly' });
    }

    // Validate metric
    const validMetrics = ['pnl', 'volume', 'winRate', 'trades'];
    if (!validMetrics.includes(metric as string)) {
      return res.status(400).json({ error: 'Invalid metric' });
    }

    let leaderboard = mockLeaderboardData[period as keyof typeof mockLeaderboardData];

    // Apply filters
    if (verified === 'true') {
      leaderboard = leaderboard.filter(trader => trader.isVerified);
    }

    // Sort by metric (already sorted by PnL by default)
    if (metric !== 'pnl') {
      leaderboard.sort((a, b) => {
        const aValue = a[metric as keyof typeof a] as number;
        const bValue = b[metric as keyof typeof b] as number;
        return bValue - aValue;
      });

      // Update ranks based on new sorting
      leaderboard = leaderboard.map((trader, index) => ({
        ...trader,
        rank: index + 1,
      }));
    }

    // Apply limit
    const limitNum = parseInt(limit as string);
    leaderboard = leaderboard.slice(0, limitNum);

    // Add additional stats
    const stats = {
      totalTraders: leaderboard.length,
      topPnL: leaderboard[0]?.pnl || 0,
      totalVolume: leaderboard.reduce((sum, trader) => sum + trader.volume, 0),
      avgWinRate: leaderboard.reduce((sum, trader) => sum + trader.winRate, 0) / leaderboard.length,
      verifiedCount: leaderboard.filter(trader => trader.isVerified).length,
    };

    res.status(200).json({
      leaderboard,
      stats,
      period,
      metric,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
'use client';

import { useState, useEffect } from 'react';
import { useAllTraders, useTraderInfo, useTraderStats } from '@/hooks/useContract';
import { formatEther } from 'viem';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Trophy, Users, TrendingUp, Clock, Twitter, Send, MessageCircle } from 'lucide-react';

interface TraderData {
  address: string;
  info: any;
  stats: any;
  winRate: number;
  roi: number;
}

export default function TradersPage() {
  const router = useRouter();
  const { data: traders, isLoading } = useAllTraders();
  const [tradersData, setTradersData] = useState<TraderData[]>([]);
  const [sortBy, setSortBy] = useState<'roi' | 'winRate' | 'copiers' | 'profit'>('roi');
  const [filterActive, setFilterActive] = useState(true);

  // Load trader data
  useEffect(() => {
    if (traders && Array.isArray(traders)) {
      loadTraderData(traders);
    }
  }, [traders]);

  const loadTraderData = async (traderAddresses: string[]) => {
    const data: TraderData[] = [];

    for (const address of traderAddresses) {
      // This would normally fetch from contract
      // For now, we'll use mock data
      data.push({
        address,
        info: {
          isActive: true,
          name: `Trader ${address.slice(0, 6)}`,
          bio: 'Professional crypto trader with 5+ years experience',
          performanceFee: 20,
          totalCopiers: Math.floor(Math.random() * 100),
          totalProfit: BigInt(Math.floor(Math.random() * 1000000) * 1e18),
          totalLoss: BigInt(Math.floor(Math.random() * 500000) * 1e18),
          minCopyAmount: BigInt(1e17), // 0.1 ETH
          maxCopyAmount: BigInt(1e19), // 10 ETH
          twitter: 'trader_' + address.slice(0, 6),
          telegram: '',
          discord: '',
        },
        stats: {
          totalTrades: Math.floor(Math.random() * 1000),
          winningTrades: Math.floor(Math.random() * 700),
          totalProfitGenerated: BigInt(Math.floor(Math.random() * 10000) * 1e18),
          totalFeesEarned: BigInt(Math.floor(Math.random() * 1000) * 1e18),
          avgWinAmount: BigInt(Math.floor(Math.random() * 100) * 1e18),
          avgLossAmount: BigInt(Math.floor(Math.random() * 50) * 1e18),
          lastTradeTimestamp: BigInt(Date.now() / 1000),
        },
        winRate: 0,
        roi: 0,
      });
    }

    // Calculate metrics
    data.forEach((trader) => {
      if (trader.stats.totalTrades > 0) {
        trader.winRate = (trader.stats.winningTrades / trader.stats.totalTrades) * 100;
      }

      const totalInvested = Number(trader.info.totalProfit) + Number(trader.info.totalLoss);
      if (totalInvested > 0) {
        trader.roi = ((Number(trader.info.totalProfit) - Number(trader.info.totalLoss)) / totalInvested) * 100;
      }
    });

    // Sort by default
    data.sort((a, b) => b.roi - a.roi);

    setTradersData(data);
  };

  const sortTraders = (key: typeof sortBy) => {
    setSortBy(key);
    const sorted = [...tradersData].sort((a, b) => {
      switch (key) {
        case 'roi':
          return b.roi - a.roi;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'copiers':
          return b.info.totalCopiers - a.info.totalCopiers;
        case 'profit':
          return Number(b.info.totalProfit - a.info.totalProfit);
        default:
          return 0;
      }
    });
    setTradersData(sorted);
  };

  const filteredTraders = filterActive
    ? tradersData.filter(t => t.info.isActive)
    : tradersData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Top Traders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Copy the best traders and multiply your success
            </p>
          </div>
          <Button
            onClick={() => router.push('/traders/register')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            Become a Trader
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Traders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tradersData.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg Win Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tradersData.length > 0
                    ? (tradersData.reduce((acc, t) => acc + t.winRate, 0) / tradersData.length).toFixed(1)
                    : 0}%
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $12.4M
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Copiers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tradersData.reduce((acc, t) => acc + t.info.totalCopiers, 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'roi' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => sortTraders('roi')}
            >
              ROI
            </Button>
            <Button
              variant={sortBy === 'winRate' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => sortTraders('winRate')}
            >
              Win Rate
            </Button>
            <Button
              variant={sortBy === 'copiers' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => sortTraders('copiers')}
            >
              Copiers
            </Button>
            <Button
              variant={sortBy === 'profit' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => sortTraders('profit')}
            >
              Profit
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={filterActive}
              onChange={(e) => setFilterActive(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="activeOnly" className="text-sm text-gray-600 dark:text-gray-400">
              Active traders only
            </label>
          </div>
        </div>
      </div>

      {/* Traders Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading traders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTraders.map((trader, index) => (
            <Card key={trader.address} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Rank Badge */}
                {index < 3 && (
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mb-3
                    ${index === 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${index === 1 ? 'bg-gray-100 text-gray-800' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-800' : ''}
                  `}>
                    #{index + 1} Trader
                  </div>
                )}

                {/* Trader Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {trader.info.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {trader.info.bio}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                    <p className={`text-lg font-semibold ${trader.winRate >= 60 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                      {trader.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                    <p className={`text-lg font-semibold ${trader.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trader.roi > 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Copiers</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {trader.info.totalCopiers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {trader.info.performanceFee}%
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-2 mb-4">
                  {trader.info.twitter && (
                    <a
                      href={`https://twitter.com/${trader.info.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {trader.info.telegram && (
                    <a
                      href={`https://t.me/${trader.info.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                  {trader.info.discord && (
                    <span className="text-gray-400 hover:text-purple-500 transition-colors cursor-pointer">
                      <MessageCircle className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/traders/${trader.address}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/copy/${trader.address}`} className="flex-1">
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                      Copy Trader
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTraders.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No traders found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Be the first to register as a trader!
          </p>
          <Button onClick={() => router.push('/traders/register')}>
            Register as Trader
          </Button>
        </div>
      )}
    </div>
  );
}
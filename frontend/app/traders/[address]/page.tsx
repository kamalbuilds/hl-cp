'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useTraderInfo, useTraderStats, useCopiers, useStartCopying, useStopCopying } from '@/hooks/useContract';
import { formatEther } from 'viem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Trophy, Users, TrendingUp, DollarSign, Calendar, Activity,
  Twitter, Send, MessageCircle, Copy, UserMinus, Settings,
  ChevronUp, ChevronDown, BarChart3, PieChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Position {
  id: number;
  market: string;
  isLong: boolean;
  size: string;
  entryPrice: string;
  currentPrice: string;
  pnl: number;
  status: 'open' | 'closed';
  timestamp: number;
}

export default function TraderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { address: userAddress, isConnected } = useAccount();
  const traderAddress = params.address as string;

  const { data: traderInfo } = useTraderInfo(traderAddress);
  const { data: traderStats } = useTraderStats(traderAddress);
  const { data: copiers } = useCopiers(traderAddress);
  const { startCopying, isLoading: isStarting } = useStartCopying();
  const { stopCopying, isLoading: isStopping } = useStopCopying();

  const [copyAmount, setCopyAmount] = useState('1.0');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'performance' | 'copiers'>('overview');
  const [positions, setPositions] = useState<Position[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock positions data
  useEffect(() => {
    // In production, this would fetch from API/contract
    setPositions([
      {
        id: 1,
        market: 'ETH-USD',
        isLong: true,
        size: '10.5',
        entryPrice: '3850.25',
        currentPrice: '3920.50',
        pnl: 1.82,
        status: 'open',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 2,
        market: 'BTC-USD',
        isLong: false,
        size: '0.5',
        entryPrice: '68500',
        currentPrice: '67800',
        pnl: 1.02,
        status: 'open',
        timestamp: Date.now() - 7200000,
      },
    ]);
  }, [traderAddress]);

  // Check if user is already copying this trader
  useEffect(() => {
    if (copiers && userAddress) {
      setIsFollowing(copiers.includes(userAddress));
    }
  }, [copiers, userAddress]);

  const handleStartCopying = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    startCopying(traderAddress, copyAmount);
    setShowCopyModal(false);
    toast.success('Started copying trader!');
  };

  const handleStopCopying = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    stopCopying(traderAddress);
    toast.success('Stopped copying trader');
  };

  const isOwnProfile = userAddress?.toLowerCase() === traderAddress?.toLowerCase();

  // Calculate metrics
  const winRate = traderStats && traderStats.totalTrades > 0
    ? (traderStats.winningTrades / traderStats.totalTrades * 100).toFixed(1)
    : '0';

  const avgProfit = traderStats && traderStats.winningTrades > 0
    ? Number(formatEther(traderStats.avgWinAmount))
    : 0;

  const avgLoss = traderStats && traderStats.totalTrades - traderStats.winningTrades > 0
    ? Number(formatEther(traderStats.avgLossAmount))
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {traderInfo?.name?.[0] || 'T'}
              </span>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {traderInfo?.name || 'Loading...'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {traderInfo?.bio || 'Professional trader'}
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {traderInfo?.twitter && (
                  <a
                    href={`https://twitter.com/${traderInfo.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {traderInfo?.telegram && (
                  <a
                    href={`https://t.me/${traderInfo.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </a>
                )}
                {traderInfo?.discord && (
                  <span className="text-gray-400 hover:text-purple-500 transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button
                onClick={() => router.push('/dashboard/trader')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage Trading
              </Button>
            ) : isFollowing ? (
              <Button
                onClick={handleStopCopying}
                loading={isStopping}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
              >
                <UserMinus className="w-4 h-4" />
                Stop Copying
              </Button>
            ) : (
              <Button
                onClick={() => setShowCopyModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                <Copy className="w-4 h-4" />
                Copy Trader
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {winRate}%
              </p>
            </div>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {traderStats?.totalTrades || 0}
              </p>
            </div>
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Copiers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {traderInfo?.totalCopiers || 0}
              </p>
            </div>
            <Users className="w-6 h-6 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit</p>
              <p className="text-xl font-bold text-green-600">
                +{traderInfo?.totalProfit ? formatEther(traderInfo.totalProfit) : '0'} ETH
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fees Earned</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {traderStats?.totalFeesEarned ? formatEther(traderStats.totalFeesEarned) : '0'} ETH
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Perf. Fee</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {traderInfo?.performanceFee || 0}%
              </p>
            </div>
            <PieChart className="w-6 h-6 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'positions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Positions
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'performance'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab('copiers')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'copiers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Copiers ({copiers?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trading Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Win</span>
                <span className="font-medium text-green-600">
                  +{avgProfit.toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Loss</span>
                <span className="font-medium text-red-600">
                  -{avgLoss.toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Risk/Reward Ratio</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  1:{avgLoss > 0 ? (avgProfit / avgLoss).toFixed(2) : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Copy Limits</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {traderInfo?.minCopyAmount ? formatEther(traderInfo.minCopyAmount) : '0'} - {' '}
                  {traderInfo?.maxCopyAmount ? formatEther(traderInfo.maxCopyAmount) : '0'} ETH
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <ChevronUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Opened Long ETH-USD
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">+2.5%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <ChevronDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Closed Short BTC-USD
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      5 hours ago
                    </p>
                  </div>
                </div>
                <span className="text-sm text-red-600 font-medium">-1.2%</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'positions' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Open Positions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Market
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Side
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Size
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Entry
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    PnL
                  </th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {position.market}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${position.isLong
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                        {position.isLong ? 'LONG' : 'SHORT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                      {position.size}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                      ${position.entryPrice}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                      ${position.currentPrice}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnl}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Chart
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BarChart3 className="w-12 h-12 text-gray-400" />
              <p className="ml-3 text-gray-500 dark:text-gray-400">Chart coming soon</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Performance
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => {
                const profit = (Math.random() - 0.3) * 20;
                return (
                  <div key={month} className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{month}</p>
                    <p className={`text-lg font-semibold ${
                      profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'copiers' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Copiers
          </h3>
          {copiers && copiers.length > 0 ? (
            <div className="space-y-3">
              {copiers.map((copier: string) => (
                <div key={copier} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {copier.slice(0, 6)}...{copier.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Copying since 2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">+5.2%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No active copiers yet
            </p>
          )}
        </Card>
      )}

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Start Copying {traderInfo?.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Copy Amount (ETH)
                </label>
                <input
                  type="number"
                  value={copyAmount}
                  onChange={(e) => setCopyAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  min={traderInfo?.minCopyAmount ? formatEther(traderInfo.minCopyAmount) : '0.1'}
                  max={traderInfo?.maxCopyAmount ? formatEther(traderInfo.maxCopyAmount) : '10'}
                  step="0.1"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Min: {traderInfo?.minCopyAmount ? formatEther(traderInfo.minCopyAmount) : '0.1'} ETH |
                  Max: {traderInfo?.maxCopyAmount ? formatEther(traderInfo.maxCopyAmount) : '10'} ETH
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Performance Fee:</strong> {traderInfo?.performanceFee || 0}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This fee is charged on profitable trades only
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartCopying}
                  loading={isStarting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  Start Copying
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTraderInfo, useTraderStats, useCopiers, useOpenPosition, useClosePosition, useUpdateTraderSettings } from '@/hooks/useContract';
import { formatEther } from 'viem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity,
  Plus, X, Settings, BarChart3, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OpenPosition {
  id: number;
  market: string;
  isLong: boolean;
  size: string;
  entryPrice: string;
  currentPrice: string;
  pnl: number;
  timestamp: number;
}

export default function TraderDashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: traderInfo } = useTraderInfo(address || '');
  const { data: traderStats } = useTraderStats(address || '');
  const { data: copiers } = useCopiers(address || '');
  const { openPosition, isLoading: isOpening } = useOpenPosition();
  const { closePosition, isLoading: isClosing } = useClosePosition();
  const { updateSettings, isLoading: isUpdating } = useUpdateTraderSettings();

  const [showNewPosition, setShowNewPosition] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [positions, setPositions] = useState<OpenPosition[]>([]);

  const [newPosition, setNewPosition] = useState({
    market: 'ETH-USD',
    isLong: true,
    size: '',
    entryPrice: '',
  });

  const [settings, setSettings] = useState({
    name: traderInfo?.name || '',
    bio: traderInfo?.bio || '',
    performanceFee: traderInfo?.performanceFee || 20,
    minCopyAmount: traderInfo?.minCopyAmount ? formatEther(traderInfo.minCopyAmount) : '0.1',
    maxCopyAmount: traderInfo?.maxCopyAmount ? formatEther(traderInfo.maxCopyAmount) : '10',
    twitter: traderInfo?.twitter || '',
    telegram: traderInfo?.telegram || '',
    discord: traderInfo?.discord || '',
  });

  const handleOpenPosition = () => {
    if (!newPosition.size || !newPosition.entryPrice) {
      toast.error('Please fill all fields');
      return;
    }

    openPosition(
      newPosition.market,
      newPosition.isLong,
      newPosition.size,
      newPosition.entryPrice
    );

    toast.success('Position opened successfully');
    setShowNewPosition(false);
    setNewPosition({ market: 'ETH-USD', isLong: true, size: '', entryPrice: '' });
  };

  const handleClosePosition = (positionId: number, pnl: number) => {
    closePosition(positionId, pnl.toString());
    toast.success('Position closed successfully');
  };

  const handleUpdateSettings = () => {
    updateSettings(
      settings.name,
      settings.bio,
      settings.performanceFee,
      settings.minCopyAmount,
      settings.maxCopyAmount,
      settings.twitter,
      settings.telegram,
      settings.discord
    );

    toast.success('Settings updated successfully');
    setShowSettings(false);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to access your trader dashboard
          </p>
        </Card>
      </div>
    );
  }

  if (!traderInfo?.isActive) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Registered as Trader
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to register as a trader to access this dashboard
          </p>
          <Button
            onClick={() => window.location.href = '/traders/register'}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            Register as Trader
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Trader Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your trades and copiers
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowNewPosition(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Plus className="w-4 h-4" />
              New Position
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Copiers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {traderInfo?.totalCopiers || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">
                +{traderInfo?.totalProfit ? formatEther(traderInfo.totalProfit) : '0'} ETH
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fees Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {traderStats?.totalFeesEarned ? formatEther(traderStats.totalFeesEarned) : '0'} ETH
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {traderStats && traderStats.totalTrades > 0
                  ? ((traderStats.winningTrades / traderStats.totalTrades) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Open Positions */}
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Open Positions
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {positions.length} active
          </span>
        </div>

        {positions.length > 0 ? (
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
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Action
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
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClosePosition(position.id, position.pnl)}
                        loading={isClosing}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Close
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No open positions</p>
          </div>
        )}
      </Card>

      {/* Copiers List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Copiers
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {copiers?.length || 0} copiers
          </span>
        </div>

        {copiers && copiers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {copiers.map((copier: string) => (
              <div key={copier} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {copier.slice(0, 6)}...{copier.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Active
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No active copiers yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Share your profile to attract copiers
            </p>
          </div>
        )}
      </Card>

      {/* New Position Modal */}
      {showNewPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Open New Position
              </h3>
              <button
                onClick={() => setShowNewPosition(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Market
                </label>
                <select
                  value={newPosition.market}
                  onChange={(e) => setNewPosition({ ...newPosition, market: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="ETH-USD">ETH-USD</option>
                  <option value="BTC-USD">BTC-USD</option>
                  <option value="SOL-USD">SOL-USD</option>
                  <option value="ARB-USD">ARB-USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Side
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewPosition({ ...newPosition, isLong: true })}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      newPosition.isLong
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    Long
                  </button>
                  <button
                    onClick={() => setNewPosition({ ...newPosition, isLong: false })}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      !newPosition.isLong
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    Short
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size (ETH)
                </label>
                <input
                  type="number"
                  value={newPosition.size}
                  onChange={(e) => setNewPosition({ ...newPosition, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Entry Price (USD)
                </label>
                <input
                  type="number"
                  value={newPosition.entryPrice}
                  onChange={(e) => setNewPosition({ ...newPosition, entryPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewPosition(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOpenPosition}
                  loading={isOpening}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  Open Position
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl mx-4 my-8 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Trader Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Performance Fee (%)
                  </label>
                  <input
                    type="number"
                    value={settings.performanceFee}
                    onChange={(e) => setSettings({ ...settings, performanceFee: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="0"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Copy Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={settings.minCopyAmount}
                    onChange={(e) => setSettings({ ...settings, minCopyAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Copy Amount (ETH)
                </label>
                <input
                  type="number"
                  value={settings.maxCopyAmount}
                  onChange={(e) => setSettings({ ...settings, maxCopyAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  step="0.1"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Social Links
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={settings.twitter}
                    onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={settings.telegram}
                    onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discord
                  </label>
                  <input
                    type="text"
                    value={settings.discord}
                    onChange={(e) => setSettings({ ...settings, discord: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="username#1234"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSettings}
                  loading={isUpdating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
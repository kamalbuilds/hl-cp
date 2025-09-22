'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity,
  Copy, UserMinus, BarChart3, PieChart, Settings, Plus
} from 'lucide-react';
import Link from 'next/link';

interface CopiedTrader {
  address: string;
  name: string;
  performance: number;
  copiedAmount: string;
  profit: number;
  positions: number;
}

interface Position {
  id: number;
  trader: string;
  market: string;
  isLong: boolean;
  size: string;
  entryPrice: string;
  currentPrice: string;
  pnl: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'overview' | 'copying' | 'positions' | 'history'>('overview');
  const [copiedTraders, setCopiedTraders] = useState<CopiedTrader[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [stats, setStats] = useState({
    totalInvested: 5.2,
    currentValue: 6.1,
    totalProfit: 0.9,
    totalReturn: 17.3,
    activeTraders: 3,
    openPositions: 7,
  });

  useEffect(() => {
    // Mock data - in production, fetch from contract/API
    setCopiedTraders([
      {
        address: '0x1234...5678',
        name: 'CryptoWhale',
        performance: 24.5,
        copiedAmount: '2.0',
        profit: 0.49,
        positions: 3,
      },
      {
        address: '0x8765...4321',
        name: 'DeFiMaster',
        performance: 18.2,
        copiedAmount: '1.5',
        profit: 0.27,
        positions: 2,
      },
      {
        address: '0xabcd...efgh',
        name: 'TrendTrader',
        performance: 12.8,
        copiedAmount: '1.7',
        profit: 0.14,
        positions: 2,
      },
    ]);

    setPositions([
      {
        id: 1,
        trader: 'CryptoWhale',
        market: 'ETH-USD',
        isLong: true,
        size: '5.2',
        entryPrice: '3850',
        currentPrice: '3920',
        pnl: 1.82,
      },
      {
        id: 2,
        trader: 'DeFiMaster',
        market: 'BTC-USD',
        isLong: false,
        size: '0.3',
        entryPrice: '68500',
        currentPrice: '67800',
        pnl: 1.02,
      },
    ]);
  }, []);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please connect your wallet to view your dashboard
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
            Connect Wallet
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
              Your Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your copy trading portfolio
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/traders')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Find Traders
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Invested</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.totalInvested} ETH
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Value</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.currentValue} ETH
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Profit</p>
          <p className="text-xl font-bold text-green-600">
            +{stats.totalProfit} ETH
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Return</p>
          <p className={`text-xl font-bold ${stats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn}%
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Traders</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.activeTraders}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Open Positions</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.openPositions}
          </p>
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
          onClick={() => setActiveTab('copying')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'copying'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Copied Traders ({copiedTraders.length})
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'positions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Positions ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Portfolio Performance
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
              <BarChart3 className="w-12 h-12 text-gray-400" />
              <p className="ml-3 text-gray-500 dark:text-gray-400">Performance chart coming soon</p>
            </div>
          </Card>

          {/* Asset Allocation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Asset Allocation
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
              <PieChart className="w-12 h-12 text-gray-400" />
              <p className="ml-3 text-gray-500 dark:text-gray-400">Allocation chart coming soon</p>
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Performing Traders
            </h3>
            <div className="space-y-3">
              {copiedTraders
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 3)
                .map((trader) => (
                  <div key={trader.address} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {trader.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {trader.positions} positions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        +{trader.performance}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        +{trader.profit} ETH
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    CryptoWhale opened ETH-USD Long
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    DeFiMaster closed BTC-USD position
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'copying' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {copiedTraders.map((trader) => (
            <Card key={trader.address} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {trader.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {trader.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Invested</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {trader.copiedAmount} ETH
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                  <p className="text-sm font-medium text-green-600">
                    +{trader.profit} ETH
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
                  <p className="text-sm font-medium text-green-600">
                    +{trader.performance}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Positions</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {trader.positions}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/traders/${trader.address}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Add Trader Card */}
          <Card
            className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => router.push('/traders')}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <Plus className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Add New Trader
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Find and copy more traders
              </p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'positions' && (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trader
                  </th>
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
                      <span className="text-sm text-gray-900 dark:text-white">
                        {position.trader}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
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
                    <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                      {position.size}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                      ${position.entryPrice}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900 dark:text-white">
                      ${position.currentPrice}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${
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

      {activeTab === 'history' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No History Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your trading history will appear here
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
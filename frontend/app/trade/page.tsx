'use client';

import { HyperCoreTrading } from '@/components/trading/HyperCoreTrading';
import { Card } from '@/components/ui/Card';
import { useAccount } from 'wagmi';
import { Activity, TrendingUp, Shield, Info } from 'lucide-react';

export default function TradePage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          HyperCore Trading
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trade directly on Hyperliquid L1 with real-time execution
        </p>
      </div>

      {/* Info Banner */}
      <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              HyperCore Integration Active
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              This interface connects directly to Hyperliquid's L1 through HyperCore precompiles,
              enabling real perpetual trading with sub-second execution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Real-time price feeds
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Direct L1 execution
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  On-chain settlement
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Oracle Prices
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Access real-time oracle prices directly from L1 for accurate market data
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Position Tracking
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor your positions with automatic PnL calculation and margin tracking
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Copy Trading
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically copy trades from successful traders with proportional sizing
          </p>
        </Card>
      </div>

      {/* Trading Interface */}
      {isConnected ? (
        <HyperCoreTrading isTrader={true} />
      ) : (
        <Card className="p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Connect Wallet to Trade
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to start trading on HyperCore
          </p>
        </Card>
      )}

      {/* Info Footer */}
      <Card className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Trading Information
            </h4>
            <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>• Orders are executed directly on Hyperliquid L1 with ~25k gas cost</li>
              <li>• Positions are tracked using HyperCore precompiles for real-time data</li>
              <li>• All trades are subject to standard Hyperliquid fees and margin requirements</li>
              <li>• Copy trading automatically mirrors leader trades with your specified leverage</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
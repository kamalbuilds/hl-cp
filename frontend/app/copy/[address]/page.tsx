'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useTraderInfo, useStartCopying } from '@/hooks/useContract';
import { formatEther } from 'viem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle, Info, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CopyTradingPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const traderAddress = params.address as string;

  const { data: traderInfo } = useTraderInfo(traderAddress);
  const { startCopying, isLoading, isSuccess, error } = useStartCopying();

  const [copyAmount, setCopyAmount] = useState('1.0');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');

  const handleStartCopying = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    const amount = parseFloat(copyAmount);
    const minAmount = traderInfo?.minCopyAmount ? parseFloat(formatEther(traderInfo.minCopyAmount)) : 0.1;
    const maxAmount = traderInfo?.maxCopyAmount ? parseFloat(formatEther(traderInfo.maxCopyAmount)) : 10;

    if (amount < minAmount || amount > maxAmount) {
      toast.error(`Amount must be between ${minAmount} and ${maxAmount} ETH`);
      return;
    }

    startCopying(traderAddress, copyAmount);
  };

  if (isSuccess) {
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Successfully Started Copying!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You are now copying {traderInfo?.name}'s trades
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to your dashboard...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Start Copy Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your copy trading settings for {traderInfo?.name || 'this trader'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Copy Amount */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Copy Amount
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to Allocate (ETH)
                  </label>
                  <input
                    type="number"
                    value={copyAmount}
                    onChange={(e) => setCopyAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={traderInfo?.minCopyAmount ? formatEther(traderInfo.minCopyAmount) : '0.1'}
                    max={traderInfo?.maxCopyAmount ? formatEther(traderInfo.maxCopyAmount) : '10'}
                    step="0.1"
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Min: {traderInfo?.minCopyAmount ? formatEther(traderInfo.minCopyAmount) : '0.1'} ETH
                    </span>
                    <span>
                      Max: {traderInfo?.maxCopyAmount ? formatEther(traderInfo.maxCopyAmount) : '10'} ETH
                    </span>
                  </div>
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {['0.5', '1.0', '2.5', '5.0'].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setCopyAmount(amount)}
                      className={copyAmount === amount ? 'bg-blue-50 border-blue-500' : ''}
                    >
                      {amount} ETH
                    </Button>
                  ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your allocated funds will be used to automatically copy this trader's positions
                        proportionally. You maintain full control and can stop copying at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Risk Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Risk Management
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Risk Tolerance
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setRiskTolerance(level)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          riskTolerance === level
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="text-center">
                          <Shield className={`w-6 h-6 mx-auto mb-1 ${
                            riskTolerance === level ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium capitalize ${
                            riskTolerance === level
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {level}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {level === 'low' && 'Conservative'}
                            {level === 'medium' && 'Balanced'}
                            {level === 'high' && 'Aggressive'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Max position size
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {riskTolerance === 'low' ? '25%' : riskTolerance === 'medium' ? '50%' : '100%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Stop-loss threshold
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {riskTolerance === 'low' ? '5%' : riskTolerance === 'medium' ? '10%' : '15%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Position scaling
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {riskTolerance === 'low' ? '0.5x' : riskTolerance === 'medium' ? '1x' : '1.5x'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Terms & Conditions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Terms & Conditions
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>1. Risk Disclosure:</strong> Copy trading involves substantial risk.
                      Past performance does not guarantee future results. You may lose all invested capital.
                    </p>
                    <p>
                      <strong>2. Performance Fees:</strong> The trader charges a {traderInfo?.performanceFee || 20}%
                      performance fee on profitable trades. This fee is automatically deducted.
                    </p>
                    <p>
                      <strong>3. No Financial Advice:</strong> Copy trading is not financial advice.
                      You are responsible for your own investment decisions.
                    </p>
                    <p>
                      <strong>4. Withdrawal Rights:</strong> You can stop copying and withdraw your funds
                      at any time. Open positions will need to be closed first.
                    </p>
                    <p>
                      <strong>5. Platform Fees:</strong> Additional platform fees may apply.
                      Check the fee schedule for details.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I have read, understood, and agree to the terms and conditions.
                    I understand the risks involved in copy trading.
                  </span>
                </label>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trader Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trader Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trader</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {traderInfo?.name || 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Performance Fee</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {traderInfo?.performanceFee || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Copiers</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {traderInfo?.totalCopiers || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Profit</span>
                  <span className="text-sm font-medium text-green-600">
                    +{traderInfo?.totalProfit ? formatEther(traderInfo.totalProfit) : '0'} ETH
                  </span>
                </div>
              </div>
            </Card>

            {/* Copy Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Copy Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Your Investment</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {copyAmount} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {riskTolerance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Est. Monthly Fee</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ~{(parseFloat(copyAmount) * 0.02).toFixed(3)} ETH
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total to Deposit
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {copyAmount} ETH
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleStartCopying}
                loading={isLoading}
                disabled={!isConnected || !acceptedTerms}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {!isConnected ? 'Connect Wallet' : 'Start Copying'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push(`/traders/${traderAddress}`)}
                className="w-full"
              >
                View Trader Profile
              </Button>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Risk Warning:</strong> Copy trading carries significant risks.
                    Only invest what you can afford to lose.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error.message || 'Failed to start copying. Please try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
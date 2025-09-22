'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { DeBridgeWidget } from '@/components/trading/deBridgeWidget';
import { Logo } from '@/components/ui/Logo';

export default function HomePage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isConnected ? (
          /* Landing Page */
          <div className="text-center space-y-12">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                🚀 Built for Hyperliquid Hackathon • Powered by deBridge
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white">
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  HyperMirror
                </span>
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200">
                Mirror the Masters, Multiply Your Success
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Revolutionary cross-chain copy trading on HyperEVM. Instantly mirror elite traders
                with sub-100ms execution, advanced risk controls, and seamless onboarding through deBridge.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Copy Trading
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Mirror trades from verified traders instantly with customizable risk management and position sizing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
                <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Cross-chain Bridge
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Seamlessly bridge assets from any supported chain to HyperEVM using deBridge integration.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Risk Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced risk controls including stop-loss, take-profit, and portfolio allocation limits.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Connect your wallet to get started
              </p>
              <ConnectButton />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Automated Trading</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Verified Traders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">$2M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Volume Traded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard for Connected Users */
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connected as {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button>
                    View Portfolio
                  </Button>
                  <Button variant="outline">
                    Browse Traders
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bridge Widget */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Bridge Assets
                </h2>
                <DeBridgeWidget
                  onSuccess={(txHash) => {
                    console.log('Bridge successful:', txHash);
                    // Handle successful bridge
                  }}
                  onError={(error) => {
                    console.error('Bridge error:', error);
                    // Handle bridge error
                  }}
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Portfolio
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">+0.00%</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Open Positions</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">No active trades</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Traders</div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">P&L</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">This session</div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Ready to start copy trading? Bridge some assets and discover top traders.
                  </p>
                  <div className="space-x-4">
                    <Button size="sm">
                      Browse Traders
                    </Button>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
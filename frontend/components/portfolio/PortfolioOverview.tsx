'use client';

import React, { useState, useEffect } from 'react';
import { Portfolio } from '@/types';
import { cn } from '@/utils/cn';

interface PortfolioOverviewProps {
  portfolio: Portfolio;
  className?: string;
}

export function PortfolioOverview({ portfolio, className }: PortfolioOverviewProps) {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '30D' | 'ALL'>('7D');
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'pnl' | 'drawdown'>('value');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPnLColor = (value: number) => {
    return value >= 0 ? 'text-success-600' : 'text-danger-600';
  };

  const getTotalPnL = () => {
    return portfolio.unrealizedPnL + portfolio.realizedPnL;
  };

  const getTotalPnLPercentage = () => {
    if (portfolio.totalValue === 0) return 0;
    return (getTotalPnL() / (portfolio.totalValue - getTotalPnL())) * 100;
  };

  const getUtilizationPercentage = () => {
    if (portfolio.totalValue === 0) return 0;
    return ((portfolio.totalValue - portfolio.availableBalance) / portfolio.totalValue) * 100;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolio.totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className={cn('text-sm font-medium', getPnLColor(getTotalPnLPercentage()))}>
              {formatPercentage(getTotalPnLPercentage())} all time
            </span>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(portfolio.availableBalance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatPercentage((portfolio.availableBalance / portfolio.totalValue) * 100)} free
            </span>
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unrealized P&L</p>
              <p className={cn('text-2xl font-bold', getPnLColor(portfolio.unrealizedPnL))}>
                {formatCurrency(portfolio.unrealizedPnL)}
              </p>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              portfolio.unrealizedPnL >= 0
                ? 'bg-success-100 dark:bg-success-900'
                : 'bg-danger-100 dark:bg-danger-900'
            )}>
              <svg className={cn(
                'w-6 h-6',
                portfolio.unrealizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'
              )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {portfolio.positions.length} open positions
            </span>
          </div>
        </div>

        {/* Realized P&L */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Realized P&L</p>
              <p className={cn('text-2xl font-bold', getPnLColor(portfolio.realizedPnL))}>
                {formatCurrency(portfolio.realizedPnL)}
              </p>
            </div>
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              portfolio.realizedPnL >= 0
                ? 'bg-success-100 dark:bg-success-900'
                : 'bg-danger-100 dark:bg-danger-900'
            )}>
              <svg className={cn(
                'w-6 h-6',
                portfolio.realizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'
              )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              This session
            </span>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Portfolio Utilization */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Portfolio Utilization</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatPercentage(getUtilizationPercentage())}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getUtilizationPercentage(), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Current Drawdown */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Current Drawdown</span>
              <span className={cn('font-medium', getPnLColor(portfolio.riskMetrics.currentDrawdown))}>
                {formatPercentage(portfolio.riskMetrics.currentDrawdown)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-danger-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.abs(portfolio.riskMetrics.currentDrawdown), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Sharpe Ratio */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Sharpe Ratio</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {portfolio.riskMetrics.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  portfolio.riskMetrics.sharpeRatio >= 1 ? 'bg-success-500' :
                  portfolio.riskMetrics.sharpeRatio >= 0.5 ? 'bg-yellow-500' : 'bg-danger-500'
                )}
                style={{ width: `${Math.min(portfolio.riskMetrics.sharpeRatio * 25, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Additional Risk Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Max Drawdown:</span>
            <span className={cn('font-medium', getPnLColor(portfolio.riskMetrics.maxDrawdown))}>
              {formatPercentage(portfolio.riskMetrics.maxDrawdown)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Volatility:</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatPercentage(portfolio.riskMetrics.volatility)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">VaR (95%):</span>
            <span className={cn('font-medium', getPnLColor(portfolio.riskMetrics.var95))}>
              {formatCurrency(portfolio.riskMetrics.var95)}
            </span>
          </div>
        </div>
      </div>

      {/* Exposure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Asset */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exposure by Asset</h3>
          <div className="space-y-3">
            {Object.entries(portfolio.riskMetrics.exposureByAsset).map(([asset, exposure]) => {
              const percentage = (exposure / portfolio.totalValue) * 100;
              return (
                <div key={asset}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{asset}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(exposure)} ({formatPercentage(percentage)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Trader */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exposure by Trader</h3>
          <div className="space-y-3">
            {Object.entries(portfolio.riskMetrics.exposureByTrader).map(([traderId, exposure]) => {
              const percentage = (exposure / portfolio.totalValue) * 100;
              return (
                <div key={traderId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">Trader {traderId}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(exposure)} ({formatPercentage(percentage)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-success-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
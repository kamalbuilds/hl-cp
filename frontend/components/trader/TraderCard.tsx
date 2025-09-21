'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Trader } from '@/types';
import { cn } from '@/utils/cn';

interface TraderCardProps {
  trader: Trader;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

export function TraderCard({
  trader,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onViewProfile,
  className,
}: TraderCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-success-600' : 'text-danger-600';
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'text-success-600';
    if (risk <= 6) return 'text-yellow-600';
    return 'text-danger-600';
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 3) return 'Low';
    if (risk <= 6) return 'Medium';
    return 'High';
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
            {trader.username ? trader.username.charAt(0).toUpperCase() : trader.address.slice(-2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {trader.username || `${trader.address.slice(0, 6)}...${trader.address.slice(-4)}`}
              </h3>
              {trader.isVerified && (
                <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {trader.followers} followers • {trader.copiers} copiers
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={cn('text-lg font-bold', getPnLColor(trader.totalPnL))}>
            {formatPercentage(trader.totalPnL)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total PnL</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPercentage(trader.winRate)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {trader.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sharpe Ratio</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${formatNumber(trader.avgPositionSize)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Position</div>
        </div>
        <div className="text-center">
          <div className={cn('text-lg font-semibold', getRiskColor(trader.riskScore))}>
            {getRiskLabel(trader.riskScore)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Risk Level</div>
        </div>
      </div>

      {/* Strategies */}
      {trader.strategies.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Strategies</div>
          <div className="flex flex-wrap gap-1">
            {trader.strategies.slice(0, 3).map((strategy, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded"
              >
                {strategy}
              </span>
            ))}
            {trader.strategies.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                +{trader.strategies.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Max Drawdown */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Max Drawdown</span>
          <span>{formatPercentage(trader.maxDrawdown)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-danger-500 h-2 rounded-full"
            style={{ width: `${Math.min(Math.abs(trader.maxDrawdown), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewProfile}
          className="flex-1"
        >
          View Profile
        </Button>
        {isFollowing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnfollow}
            className="flex-1"
          >
            Unfollow
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onFollow}
            className="flex-1"
          >
            Follow
          </Button>
        )}
      </div>
    </div>
  );
}
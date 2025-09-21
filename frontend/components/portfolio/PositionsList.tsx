'use client';

import React, { useState } from 'react';
import { Position } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface PositionsListProps {
  positions: Position[];
  onClosePosition?: (positionId: string) => void;
  onViewTrader?: (traderId: string) => void;
  className?: string;
}

export function PositionsList({
  positions,
  onClosePosition,
  onViewTrader,
  className
}: PositionsListProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closed'>('open');
  const [sortBy, setSortBy] = useState<'timestamp' | 'unrealizedPnL' | 'size'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-success-600' : 'text-danger-600';
  };

  const getSideColor = (side: 'long' | 'short') => {
    return side === 'long' ? 'text-success-600' : 'text-danger-600';
  };

  const filteredAndSortedPositions = React.useMemo(() => {
    let filtered = positions;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(position => {
        return selectedStatus === 'open' ? position.status === 'open' : position.status === 'closed';
      });
    }

    // Sort positions
    filtered.sort((a, b) => {
      let aValue = a[sortBy] as number;
      let bValue = b[sortBy] as number;

      if (sortBy === 'unrealizedPnL') {
        aValue = a.unrealizedPnL;
        bValue = b.unrealizedPnL;
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [positions, selectedStatus, sortBy, sortOrder]);

  const totalUnrealizedPnL = positions
    .filter(p => p.status === 'open')
    .reduce((sum, p) => sum + p.unrealizedPnL, 0);

  const openPositionsCount = positions.filter(p => p.status === 'open').length;

  if (positions.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2-2V7a2 2 0 00-2-2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No positions yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Start copy trading to see your positions appear here. Follow some traders and enable copy trading to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Positions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {openPositionsCount} open positions • {formatCurrency(totalUnrealizedPnL)} unrealized P&L
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Status Filter */}
          <div className="flex space-x-2">
            {['all', 'open', 'closed'].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status as typeof selectedStatus)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="timestamp">Time</option>
              <option value="unrealizedPnL">P&L</option>
              <option value="size">Size</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </Button>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trader
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedPositions.map((position) => (
              <tr key={position.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {position.symbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {position.leverage}x leverage
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase',
                    position.side === 'long'
                      ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                      : 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300'
                  )}>
                    {position.side}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(position.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${position.entryPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${position.currentPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={cn('text-sm font-medium', getPnLColor(position.unrealizedPnL))}>
                    {formatCurrency(position.unrealizedPnL)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {((position.unrealizedPnL / position.size) * 100).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewTrader?.(position.traderId)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Trader {position.traderId}
                  </Button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {position.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onClosePosition?.(position.id)}
                      >
                        Close
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      Details
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedPositions.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            No positions found for the selected filters.
          </div>
        </div>
      )}
    </div>
  );
}
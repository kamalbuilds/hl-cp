'use client';

import React, { useState, useMemo } from 'react';
import { TraderCard } from './TraderCard';
import { Button } from '@/components/ui/Button';
import { Trader } from '@/types';
import { cn } from '@/utils/cn';

interface TraderListProps {
  traders: Trader[];
  followedTraders?: string[];
  onFollow?: (traderId: string) => void;
  onUnfollow?: (traderId: string) => void;
  onViewProfile?: (traderId: string) => void;
  className?: string;
}

type SortField = 'totalPnL' | 'winRate' | 'followers' | 'sharpeRatio' | 'riskScore';
type SortDirection = 'asc' | 'desc';

export function TraderList({
  traders,
  followedTraders = [],
  onFollow,
  onUnfollow,
  onViewProfile,
  className,
}: TraderListProps) {
  const [sortField, setSortField] = useState<SortField>('totalPnL');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredTraders = useMemo(() => {
    let filtered = traders.filter((trader) => {
      // Search filter
      const matchesSearch = !searchTerm ||
        trader.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trader.address.toLowerCase().includes(searchTerm.toLowerCase());

      // Risk filter
      const matchesRisk = filterRisk === 'all' ||
        (filterRisk === 'low' && trader.riskScore <= 3) ||
        (filterRisk === 'medium' && trader.riskScore > 3 && trader.riskScore <= 6) ||
        (filterRisk === 'high' && trader.riskScore > 6);

      return matchesSearch && matchesRisk;
    });

    // Sort traders
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [traders, sortField, sortDirection, filterRisk, searchTerm]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search traders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Risk Filter */}
          <div className="flex space-x-2">
            {['all', 'low', 'medium', 'high'].map((risk) => (
              <Button
                key={risk}
                variant={filterRisk === risk ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRisk(risk as typeof filterRisk)}
              >
                {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">Sort by:</span>
          {[
            { field: 'totalPnL' as SortField, label: 'PnL' },
            { field: 'winRate' as SortField, label: 'Win Rate' },
            { field: 'followers' as SortField, label: 'Followers' },
            { field: 'sharpeRatio' as SortField, label: 'Sharpe Ratio' },
            { field: 'riskScore' as SortField, label: 'Risk Score' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={cn(
                'flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors',
                field === sortField
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <span>{label}</span>
              {getSortIcon(field)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {sortedAndFilteredTraders.length} of {traders.length} traders
      </div>

      {/* Trader Grid */}
      {sortedAndFilteredTraders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No traders found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Try adjusting your search criteria or filters to find more traders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAndFilteredTraders.map((trader) => (
            <TraderCard
              key={trader.id}
              trader={trader}
              isFollowing={followedTraders.includes(trader.id)}
              onFollow={() => onFollow?.(trader.id)}
              onUnfollow={() => onUnfollow?.(trader.id)}
              onViewProfile={() => onViewProfile?.(trader.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
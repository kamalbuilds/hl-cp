'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePriceComparison, usePythPriceStream, usePythSymbols } from '../../hooks/usePythPrices';

interface PriceComparisonProps {
  symbols?: string[];
  hyperCorePrices?: Record<string, number>;
  refreshInterval?: number;
  className?: string;
}

interface PriceRowProps {
  symbol: string;
  hyperCorePrice?: number;
  onSymbolToggle?: (symbol: string, enabled: boolean) => void;
  isEnabled?: boolean;
}

const PriceRow: React.FC<PriceRowProps> = ({
  symbol,
  hyperCorePrice,
  onSymbolToggle,
  isEnabled = true
}) => {
  const {
    pythPrice,
    comparison,
    confidence,
    loading,
    error
  } = usePriceComparison(symbol, hyperCorePrice);

  const getPriceChangeIcon = () => {
    if (!comparison) return <Minus className="h-4 w-4 text-gray-400" />;

    if (comparison.priceDifferencePercent > 0.1) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (comparison.priceDifferencePercent < -0.1) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getRecommendationBadge = () => {
    if (!comparison) return null;

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'buy_pyth': 'default',
      'buy_hypercore': 'secondary',
      'hold': 'outline',
      'insufficient_data': 'destructive'
    };

    const labels = {
      'buy_pyth': 'Buy via Pyth',
      'buy_hypercore': 'Buy via HyperCore',
      'hold': 'Hold',
      'insufficient_data': 'No Data'
    };

    return (
      <Badge variant={variants[comparison.recommendation]}>
        {labels[comparison.recommendation]}
      </Badge>
    );
  };

  const getConfidenceBadge = () => {
    if (!confidence) return null;

    const color = confidence.qualityScore >= 95 ? 'text-green-600' :
                  confidence.qualityScore >= 85 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {confidence.isReliable ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <AlertTriangle className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {confidence.qualityScore.toFixed(0)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 border-b animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-red-50">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{symbol}</span>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <span className="text-sm text-red-600">{error.message}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-lg">{symbol}</span>
          {onSymbolToggle && (
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onSymbolToggle(symbol, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}
        </div>
        {getPriceChangeIcon()}
        {getConfidenceBadge()}
      </div>

      <div className="flex items-center space-x-6">
        {/* Pyth Price */}
        <div className="text-right">
          <div className="text-sm text-gray-500">Pyth</div>
          <div className="font-semibold">
            {pythPrice ? `$${pythPrice.price.toFixed(4)}` : 'N/A'}
          </div>
        </div>

        {/* HyperCore Price */}
        <div className="text-right">
          <div className="text-sm text-gray-500">HyperCore</div>
          <div className="font-semibold">
            {hyperCorePrice ? `$${hyperCorePrice.toFixed(4)}` : 'N/A'}
          </div>
        </div>

        {/* Price Difference */}
        <div className="text-right">
          <div className="text-sm text-gray-500">Spread</div>
          <div className={`font-semibold ${
            comparison && Math.abs(comparison.priceDifferencePercent) > 0.5
              ? 'text-orange-600'
              : 'text-gray-900'
          }`}>
            {comparison ? `${comparison.priceDifferencePercent.toFixed(2)}%` : 'N/A'}
          </div>
        </div>

        {/* Recommendation */}
        <div className="text-right min-w-[120px]">
          {getRecommendationBadge()}
        </div>

        {/* Arbitrage Indicator */}
        {comparison?.isArbitrage && (
          <div className="text-right">
            <Badge variant="default" className="bg-green-600">
              Arbitrage
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

const PriceComparison: React.FC<PriceComparisonProps> = ({
  symbols: initialSymbols,
  hyperCorePrices = {},
  refreshInterval = 5000,
  className
}) => {
  const { symbols: availableSymbols } = usePythSymbols();
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(
    initialSymbols || ['BTC', 'ETH', 'SOL']
  );
  const [enabledSymbols, setEnabledSymbols] = useState<Set<string>>(
    new Set(initialSymbols || ['BTC', 'ETH', 'SOL'])
  );
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const {
    prices,
    loading: streamLoading,
    error: streamError,
    isStreaming,
    startStreaming,
    stopStreaming
  } = usePythPriceStream(selectedSymbols, refreshInterval);

  const handleSymbolToggle = (symbol: string, enabled: boolean) => {
    const newEnabledSymbols = new Set(enabledSymbols);
    if (enabled) {
      newEnabledSymbols.add(symbol);
    } else {
      newEnabledSymbols.delete(symbol);
    }
    setEnabledSymbols(newEnabledSymbols);
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Restart streaming to force refresh
    stopStreaming();
    setTimeout(() => startStreaming(), 100);
  };

  const getOverallStats = () => {
    const activeComparisons = selectedSymbols
      .filter(symbol => enabledSymbols.has(symbol))
      .map(symbol => ({ symbol, hyperCorePrice: hyperCorePrices[symbol] }))
      .filter(({ hyperCorePrice }) => hyperCorePrice !== undefined);

    const arbitrageOpportunities = activeComparisons.filter(({ symbol, hyperCorePrice }) => {
      const pythPrice = prices.get(symbol);
      if (!pythPrice || !hyperCorePrice) return false;

      const spread = Math.abs((pythPrice.price - hyperCorePrice) / hyperCorePrice * 100);
      return spread > 0.5;
    });

    return {
      totalPairs: activeComparisons.length,
      arbitrageCount: arbitrageOpportunities.length,
      averageSpread: activeComparisons.length > 0
        ? activeComparisons.reduce((sum, { symbol, hyperCorePrice }) => {
            const pythPrice = prices.get(symbol);
            if (!pythPrice || !hyperCorePrice) return sum;
            return sum + Math.abs((pythPrice.price - hyperCorePrice) / hyperCorePrice * 100);
          }, 0) / activeComparisons.length
        : 0
    };
  };

  const stats = getOverallStats();

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Price Comparison Dashboard</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isStreaming ? "default" : "secondary"}>
              {isStreaming ? 'Live' : 'Stopped'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={streamLoading}
            >
              <RefreshCw className={`h-4 w-4 ${streamLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalPairs}</div>
            <div className="text-sm text-gray-600">Active Pairs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.arbitrageCount}</div>
            <div className="text-sm text-gray-600">Arbitrage Ops</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageSpread.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Avg Spread</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {streamError && (
          <div className="p-4 bg-red-50 border-b">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{streamError.message}</span>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b font-medium text-sm text-gray-700">
          <div className="flex items-center space-x-4">
            <span>Symbol</span>
            <span>Confidence</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>Pyth Price</span>
            <span>HyperCore Price</span>
            <span>Spread</span>
            <span>Recommendation</span>
          </div>
        </div>

        {/* Price Rows */}
        <div className="max-h-96 overflow-y-auto">
          {selectedSymbols.map(symbol => (
            <PriceRow
              key={symbol}
              symbol={symbol}
              hyperCorePrice={hyperCorePrices[symbol]}
              onSymbolToggle={handleSymbolToggle}
              isEnabled={enabledSymbols.has(symbol)}
            />
          ))}
        </div>

        {selectedSymbols.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No symbols selected for comparison</p>
            <p className="text-sm mt-1">Add symbols to start comparing prices</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            <span>Powered by Pyth Network & HyperCore</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceComparison;
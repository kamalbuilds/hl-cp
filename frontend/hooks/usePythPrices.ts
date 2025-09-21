import { useState, useEffect, useCallback, useRef } from 'react';
import { pythPriceFeedsService, PythPrice, PythPriceUpdate } from '../components/pyth/pyth-pricefeeds';

export interface PriceError {
  message: string;
  code?: string;
  timestamp: number;
}

export interface ConfidenceMetrics {
  level: number;
  interval: {
    lower: number;
    upper: number;
    percentage: number;
  };
  isReliable: boolean;
  qualityScore: number;
}

/**
 * Hook to get the latest price for a single symbol
 */
export function usePythPrice(symbol: string) {
  const [price, setPrice] = useState<PythPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PriceError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const latestPrice = await pythPriceFeedsService.getLatestPrice(symbol);
      if (latestPrice) {
        setPrice(latestPrice);
        setLastUpdated(Date.now());
      } else {
        setError({
          message: `No price data available for ${symbol}`,
          code: 'NO_DATA',
          timestamp: Date.now()
        });
      }
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch price',
        code: 'FETCH_ERROR',
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const refresh = useCallback(() => {
    fetchPrice();
  }, [fetchPrice]);

  const formatPrice = useCallback((value?: number) => {
    if (!price || value === undefined) return '0.00';
    return pythPriceFeedsService.formatPrice(value, symbol);
  }, [price, symbol]);

  const isStale = useCallback((maxAgeMs: number = 30000) => {
    if (!price) return true;
    return pythPriceFeedsService.isPriceStale(price, maxAgeMs);
  }, [price]);

  return {
    price,
    loading,
    error,
    lastUpdated,
    refresh,
    formatPrice,
    isStale,
    cached: price ? pythPriceFeedsService.getCachedPrice(symbol) : null
  };
}

/**
 * Hook to stream real-time price updates for multiple symbols
 */
export function usePythPriceStream(symbols: string[], updateInterval: number = 1000) {
  const [prices, setPrices] = useState<Map<string, PythPrice>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PriceError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const unsubscribeFunctions = useRef<Map<string, () => void>>(new Map());

  const startStreaming = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Get initial prices
      const initialPrices = await pythPriceFeedsService.getLatestPrices(symbols);
      setPrices(new Map(initialPrices));
      setLastUpdated(Date.now());

      // Set up streaming for each symbol
      symbols.forEach(symbol => {
        // Clean up existing subscription if any
        const existingUnsubscribe = unsubscribeFunctions.current.get(symbol);
        if (existingUnsubscribe) {
          existingUnsubscribe();
        }

        // Subscribe to updates
        const unsubscribe = pythPriceFeedsService.subscribeToPriceUpdates(
          symbol,
          (update: PythPriceUpdate) => {
            setPrices(prev => {
              const newPrices = new Map(prev);
              newPrices.set(update.symbol, update.price);
              return newPrices;
            });
            setLastUpdated(update.timestamp);
          }
        );

        unsubscribeFunctions.current.set(symbol, unsubscribe);
      });

    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to start price streaming',
        code: 'STREAM_ERROR',
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  const stopStreaming = useCallback(() => {
    // Unsubscribe from all price updates
    unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctions.current.clear();
  }, []);

  useEffect(() => {
    startStreaming();

    return () => {
      stopStreaming();
    };
  }, [startStreaming, stopStreaming]);

  const getPriceBySymbol = useCallback((symbol: string) => {
    return prices.get(symbol.toUpperCase()) || null;
  }, [prices]);

  const getAllPrices = useCallback(() => {
    return Array.from(prices.entries()).map(([symbolKey, price]) => ({
      symbol: symbolKey,
      ...price
    }));
  }, [prices]);

  const formatPrice = useCallback((symbol: string, value?: number) => {
    const price = getPriceBySymbol(symbol);
    if (!price || value === undefined) return '0.00';
    return pythPriceFeedsService.formatPrice(value, symbol);
  }, [getPriceBySymbol]);

  return {
    prices,
    loading,
    error,
    lastUpdated,
    startStreaming,
    stopStreaming,
    getPriceBySymbol,
    getAllPrices,
    formatPrice,
    symbolCount: prices.size,
    isStreaming: unsubscribeFunctions.current.size > 0
  };
}

/**
 * Hook to get confidence levels and quality metrics for price data
 */
export function usePythConfidence(symbol: string, confidenceLevel: number = 0.95) {
  const { price, loading, error } = usePythPrice(symbol);
  const [confidence, setConfidence] = useState<ConfidenceMetrics | null>(null);

  useEffect(() => {
    if (!price) {
      setConfidence(null);
      return;
    }

    try {
      const interval = pythPriceFeedsService.getConfidenceInterval(price, confidenceLevel);

      // Calculate quality score based on confidence percentage
      const qualityScore = Math.max(0, Math.min(100, 100 - interval.percentage));

      // Consider reliable if confidence is less than 1% of price
      const isReliable = interval.percentage < 1.0;

      setConfidence({
        level: confidenceLevel,
        interval,
        isReliable,
        qualityScore
      });
    } catch (err) {
      console.error('Error calculating confidence metrics:', err);
      setConfidence(null);
    }
  }, [price, confidenceLevel]);

  const getQualityLabel = useCallback(() => {
    if (!confidence) return 'Unknown';

    if (confidence.qualityScore >= 99) return 'Excellent';
    if (confidence.qualityScore >= 95) return 'Very Good';
    if (confidence.qualityScore >= 90) return 'Good';
    if (confidence.qualityScore >= 80) return 'Fair';
    return 'Poor';
  }, [confidence]);

  const getConfidenceColor = useCallback(() => {
    if (!confidence) return 'gray';

    if (confidence.qualityScore >= 95) return 'green';
    if (confidence.qualityScore >= 85) return 'yellow';
    return 'red';
  }, [confidence]);

  return {
    confidence,
    loading,
    error,
    getQualityLabel,
    getConfidenceColor,
    isReliable: confidence?.isReliable ?? false,
    qualityScore: confidence?.qualityScore ?? 0
  };
}

/**
 * Hook to compare prices from multiple sources
 */
export function usePriceComparison(symbol: string, hyperCorePrice?: number) {
  const { price: pythPrice, loading: pythLoading, error: pythError } = usePythPrice(symbol);
  const { confidence } = usePythConfidence(symbol);

  const [comparison, setComparison] = useState<{
    priceDifference: number;
    priceDifferencePercent: number;
    priceSpread: number;
    isArbitrage: boolean;
    recommendation: 'buy_pyth' | 'buy_hypercore' | 'hold' | 'insufficient_data';
  } | null>(null);

  useEffect(() => {
    if (!pythPrice || hyperCorePrice === undefined) {
      setComparison(null);
      return;
    }

    const priceDifference = pythPrice.price - hyperCorePrice;
    const priceDifferencePercent = (priceDifference / hyperCorePrice) * 100;
    const priceSpread = Math.abs(priceDifferencePercent);

    // Consider arbitrage opportunity if spread > 0.5% and confidence is high
    const isArbitrage = priceSpread > 0.5 && (confidence?.isReliable ?? false);

    let recommendation: 'buy_pyth' | 'buy_hypercore' | 'hold' | 'insufficient_data' = 'insufficient_data';

    if (confidence?.isReliable) {
      if (priceSpread < 0.1) {
        recommendation = 'hold';
      } else if (pythPrice.price < hyperCorePrice) {
        recommendation = 'buy_pyth';
      } else {
        recommendation = 'buy_hypercore';
      }
    }

    setComparison({
      priceDifference,
      priceDifferencePercent,
      priceSpread,
      isArbitrage,
      recommendation
    });
  }, [pythPrice, hyperCorePrice, confidence]);

  return {
    pythPrice,
    hyperCorePrice,
    comparison,
    confidence,
    loading: pythLoading,
    error: pythError
  };
}

/**
 * Hook to get available symbols and their status
 */
export function usePythSymbols() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const availableSymbols = pythPriceFeedsService.getAvailableSymbols();
      setSymbols(availableSymbols);
    } catch (error) {
      console.error('Error getting available symbols:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    symbols,
    loading,
    count: symbols.length
  };
}
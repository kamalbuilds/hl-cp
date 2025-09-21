'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  useOraclePrice,
  useBestBidOffer,
  usePlaceLimitOrder,
  useAccountMargin,
  useHyperCorePosition,
  ASSET_INDICES,
  TIF,
} from '@/hooks/useHyperCore';
import { usePythPrice, usePythConfidence } from '@/hooks/usePythPrices';
import { SupportedSymbol, PYTH_PRICE_FEED_IDS } from '@/components/pyth/pyth-pricefeeds';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  AlertCircle, ChevronUp, ChevronDown, Info, Wifi, WifiOff, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface HyperCoreTradingProps {
  isTrader?: boolean;
  onTradeExecuted?: (trade: any) => void;
}

export function HyperCoreTrading({ isTrader = false, onTradeExecuted }: HyperCoreTradingProps) {
  const { address, isConnected } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState('ETH-USD');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState('10');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tif, setTif] = useState<TIF>(TIF.GTC);
  const [priceSource, setPriceSource] = useState<'pyth' | 'hypercore'>('pyth');

  // Get real-time data from HyperCore
  const { price: oraclePrice } = useOraclePrice(ASSET_INDICES[selectedMarket]);
  const { bid, ask, spread, spreadPercent } = useBestBidOffer(ASSET_INDICES[selectedMarket]);
  const { accountValue, marginUsed, freeMargin, marginRatio } = useAccountMargin(address || '');
  const { data: position } = useHyperCorePosition(address || '', ASSET_INDICES[selectedMarket]);

  const { placeLimitOrder, isLoading: isPlacingOrder, isSuccess } = usePlaceLimitOrder();

  // Get Pyth price data
  const pythSymbol = selectedMarket.replace('-', '/') as SupportedSymbol;
  const {
    price: pythPriceData,
    loading: pythLoading,
    error: pythError,
    lastUpdate: pythLastUpdate,
    isStale: pythIsStale,
    confidenceInterval: pythConfidenceInterval,
    formattedPrice: pythFormattedPrice,
    refresh: refreshPythPrice,
  } = usePythPrice(pythSymbol);

  // Get confidence information
  const pythPrices = new Map();
  if (pythPriceData) {
    pythPrices.set(pythSymbol, pythPriceData);
  }
  const { getConfidenceLevel, getConfidenceColor, getConfidenceDescription } = usePythConfidence(pythPrices);

  // Calculate price differences
  const pythPrice = pythPriceData?.price || 0;
  const priceDifference = pythPrice > 0 ? pythPrice - oraclePrice : 0;
  const priceDifferencePercent = oraclePrice > 0 ? (priceDifference / oraclePrice) * 100 : 0;

  // Determine which price to use for trading
  const displayPrice = priceSource === 'pyth' ? pythPrice : oraclePrice;
  const priceSourceStatus = pythLoading ? 'loading' : pythError ? 'error' : pythIsStale ? 'stale' : 'live';

  // Auto-fill price with best bid/ask
  useEffect(() => {
    if (orderType === 'limit' && !price) {
      setPrice(side === 'buy' ? bid.toFixed(2) : ask.toFixed(2));
    }
  }, [bid, ask, side, orderType, price]);

  // Calculate position value and PnL
  const positionSize = position ? Number(position.szi) / 1e8 : 0;
  const entryPrice = position && positionSize !== 0 ? Number(position.entryNtl) / positionSize / 1e8 : 0;
  const unrealizedPnL = positionSize !== 0
    ? positionSize * (oraclePrice - entryPrice)
    : 0;
  const pnlPercent = entryPrice > 0 ? (unrealizedPnL / (Math.abs(positionSize) * entryPrice)) * 100 : 0;

  const handleSubmitOrder = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!size || parseFloat(size) <= 0) {
      toast.error('Please enter a valid size');
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }

    const orderPrice = orderType === 'market'
      ? (side === 'buy' ? ask : bid)
      : parseFloat(price);

    const orderSize = parseFloat(size);

    // Check margin requirements
    const requiredMargin = (orderSize * orderPrice) / parseFloat(leverage);
    if (requiredMargin > freeMargin) {
      toast.error(`Insufficient margin. Required: $${requiredMargin.toFixed(2)}, Available: $${freeMargin.toFixed(2)}`);
      return;
    }

    try {
      placeLimitOrder(
        selectedMarket,
        side === 'buy',
        orderPrice,
        orderSize,
        reduceOnly,
        orderType === 'market' ? TIF.IOC : tif
      );

      toast.success(`${side.toUpperCase()} order placed for ${orderSize} ${selectedMarket.split('-')[0]}`);

      // Clear form
      setSize('');
      if (orderType === 'limit') setPrice('');

      // Notify parent component
      if (onTradeExecuted) {
        onTradeExecuted({
          market: selectedMarket,
          side,
          price: orderPrice,
          size: orderSize,
          timestamp: Date.now(),
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Info */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market Information
          </h3>
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {Object.keys(ASSET_INDICES).map((market) => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Oracle Price</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${oraclePrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Bid</p>
            <p className="text-lg font-semibold text-green-600">
              ${bid.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Ask</p>
            <p className="text-lg font-semibold text-red-600">
              ${ask.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Spread</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${spread.toFixed(2)} ({spreadPercent.toFixed(3)}%)
            </p>
          </div>
        </div>
      </Card>

      {/* Account & Position Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Margin */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Margin
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Account Value</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${accountValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Margin Used</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${marginUsed.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Free Margin</span>
              <span className="text-sm font-medium text-green-600">
                ${freeMargin.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Margin Ratio</span>
                <span className={`text-sm font-medium ${
                  marginRatio > 80 ? 'text-red-600' : marginRatio > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {marginRatio.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    marginRatio > 80 ? 'bg-red-500' : marginRatio > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(marginRatio, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Current Position */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Position
          </h3>
          {positionSize !== 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Size</span>
                <span className={`text-sm font-medium ${
                  positionSize > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {positionSize > 0 ? '+' : ''}{positionSize.toFixed(4)} {selectedMarket.split('-')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Entry Price</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${entryPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Price</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${oraclePrice.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Unrealized PnL</span>
                  <span className={`text-sm font-medium ${
                    unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No open position</p>
            </div>
          )}
        </Card>
      </div>

      {/* Trading Panel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Place Order
        </h3>

        {/* Order Type Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              orderType === 'limit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Limit Order
          </button>
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              orderType === 'market'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Market Order
          </button>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setSide('buy')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              side === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <TrendingUp className="inline w-4 h-4 mr-1" />
            Buy / Long
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              side === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <TrendingDown className="inline w-4 h-4 mr-1" />
            Sell / Short
          </button>
        </div>

        <div className="space-y-4">
          {/* Price Input (Limit Order Only) */}
          {orderType === 'limit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                />
                <button
                  onClick={() => setPrice(side === 'buy' ? bid.toFixed(2) : ask.toFixed(2))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs
                    bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {side === 'buy' ? 'BID' : 'ASK'}
                </button>
              </div>
            </div>
          )}

          {/* Size Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Size ({selectedMarket.split('-')[0]})
            </label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="0.00"
              step="0.01"
            />
            {/* Quick Size Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {['0.01', '0.1', '0.5', '1.0'].map((quickSize) => (
                <button
                  key={quickSize}
                  onClick={() => setSize(quickSize)}
                  className="py-1 px-2 text-xs bg-gray-100 dark:bg-gray-700 rounded
                    hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {quickSize}
                </button>
              ))}
            </div>
          </div>

          {/* Leverage Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leverage: {leverage}x
            </label>
            <input
              type="range"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              min="1"
              max="50"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1x</span>
              <span>10x</span>
              <span>25x</span>
              <span>50x</span>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time in Force
                </label>
                <select
                  value={tif}
                  onChange={(e) => setTif(Number(e.target.value) as TIF)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value={TIF.GTC}>Good Till Cancel (GTC)</option>
                  <option value={TIF.IOC}>Immediate or Cancel (IOC)</option>
                  <option value={TIF.ALO}>Add Liquidity Only (ALO)</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={reduceOnly}
                onChange={(e) => setReduceOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Reduce Only
              </span>
              <Info className="w-4 h-4 text-gray-400" />
            </label>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Order Value</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(parseFloat(size || '0') * (orderType === 'market'
                  ? (side === 'buy' ? ask : bid)
                  : parseFloat(price || '0'))).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Required Margin</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(parseFloat(size || '0') * (orderType === 'market'
                  ? (side === 'buy' ? ask : bid)
                  : parseFloat(price || '0')) / parseFloat(leverage)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitOrder}
            loading={isPlacingOrder}
            disabled={!isConnected || !size || (orderType === 'limit' && !price)}
            className={`w-full ${
              side === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
          >
            {!isConnected
              ? 'Connect Wallet'
              : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedMarket.split('-')[0]}`}
          </Button>

          {/* Risk Warning */}
          {parseFloat(leverage) > 20 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="ml-2 text-sm text-yellow-700 dark:text-yellow-300">
                  High leverage ({leverage}x) significantly increases risk. Use with caution.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
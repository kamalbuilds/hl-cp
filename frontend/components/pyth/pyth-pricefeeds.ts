import { HermesClient } from '@pythnetwork/hermes-client';

// Pyth Network price feed IDs for major assets
export const PYTH_PRICE_FEED_IDS = {
  'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'SOL/USD': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'ARB/USD': '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
  'MATIC/USD': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
  'AVAX/USD': '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
  'BNB/USD': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
  'APT/USD': '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
  'DOGE/USD': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
  'LTC/USD': '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
} as const;

export type SupportedSymbol = keyof typeof PYTH_PRICE_FEED_IDS;

export interface PythPriceData {
  symbol: SupportedSymbol;
  price: number;
  confidence: number;
  expo: number;
  publishTime: number;
  prevPublishTime: number;
  emaPrice: number;
  emaConfidence: number;
}

export interface PriceUpdate {
  symbol: SupportedSymbol;
  data: PythPriceData;
  timestamp: number;
}

class PythPriceFeedsService {
  private hermesClient: HermesClient;
  private isInitialized = false;
  private subscribers: Map<string, (update: PriceUpdate) => void> = new Map();
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;

  constructor() {
    this.hermesClient = new HermesClient('https://hermes.pyth.network');
    this.isInitialized = true;
  }

  /**
   * Get latest price data for a specific symbol
   */
  async getLatestPrice(symbol: SupportedSymbol): Promise<PythPriceData | null> {
    try {
      const priceId = PYTH_PRICE_FEED_IDS[symbol];
      const priceFeeds = await this.priceServiceConnection.getLatestPriceFeeds([priceId]);

      if (priceFeeds && priceFeeds.length > 0) {
        const priceFeed = priceFeeds[0];
        const price = priceFeed.getPriceUnchecked();
        const emaPrice = priceFeed.getEmaPriceUnchecked();

        return {
          symbol,
          price: parseFloat(price.price) * Math.pow(10, price.expo),
          confidence: parseFloat(price.conf) * Math.pow(10, price.expo),
          expo: price.expo,
          publishTime: price.publishTime,
          prevPublishTime: price.prevPublishTime || 0,
          emaPrice: parseFloat(emaPrice.price) * Math.pow(10, emaPrice.expo),
          emaConfidence: parseFloat(emaPrice.conf) * Math.pow(10, emaPrice.expo),
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get latest prices for multiple symbols
   */
  async getLatestPrices(symbols: SupportedSymbol[]): Promise<Map<SupportedSymbol, PythPriceData>> {
    const priceMap = new Map<SupportedSymbol, PythPriceData>();

    try {
      const priceIds = symbols.map(symbol => PYTH_PRICE_FEED_IDS[symbol]);
      const priceFeeds = await this.priceServiceConnection.getLatestPriceFeeds(priceIds);

      priceFeeds.forEach((priceFeed, index) => {
        const symbol = symbols[index];
        const price = priceFeed.getPriceUnchecked();
        const emaPrice = priceFeed.getEmaPriceUnchecked();

        priceMap.set(symbol, {
          symbol,
          price: parseFloat(price.price) * Math.pow(10, price.expo),
          confidence: parseFloat(price.conf) * Math.pow(10, price.expo),
          expo: price.expo,
          publishTime: price.publishTime,
          prevPublishTime: price.prevPublishTime || 0,
          emaPrice: parseFloat(emaPrice.price) * Math.pow(10, emaPrice.expo),
          emaConfidence: parseFloat(emaPrice.conf) * Math.pow(10, emaPrice.expo),
        });
      });
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
    }

    return priceMap;
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   */
  subscribeToPrice(symbol: SupportedSymbol, callback: (update: PriceUpdate) => void): string {
    const subscriptionId = `${symbol}_${Date.now()}`;
    this.subscribers.set(subscriptionId, callback);

    if (!this.isConnected) {
      this.connectWebSocket();
    }

    return subscriptionId;
  }

  /**
   * Subscribe to multiple symbols
   */
  subscribeToMultiplePrices(
    symbols: SupportedSymbol[],
    callback: (update: PriceUpdate) => void
  ): string[] {
    return symbols.map(symbol => this.subscribeToPrice(symbol, callback));
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);

    if (this.subscribers.size === 0 && this.websocket) {
      this.disconnectWebSocket();
    }
  }

  /**
   * Get confidence interval as percentage
   */
  getConfidenceInterval(priceData: PythPriceData): number {
    if (priceData.price === 0) return 0;
    return (priceData.confidence / priceData.price) * 100;
  }

  /**
   * Check if price data is stale (older than 60 seconds)
   */
  isPriceStale(priceData: PythPriceData): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - priceData.publishTime;
    return timeDiff > 60; // 60 seconds threshold
  }

  /**
   * Format price with appropriate decimal places
   */
  formatPrice(price: number, symbol: SupportedSymbol): string {
    // Most crypto prices should show 2-6 decimal places
    if (price > 1000) return price.toFixed(2);
    if (price > 1) return price.toFixed(4);
    return price.toFixed(6);
  }

  private connectWebSocket(): void {
    try {
      // Use Pyth Network's WebSocket endpoint for real-time updates
      this.websocket = new WebSocket('wss://hermes.pyth.network/ws');

      this.websocket.onopen = () => {
        console.log('Pyth WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Subscribe to all price feeds we're interested in
        const allPriceIds = Object.values(PYTH_PRICE_FEED_IDS);
        this.websocket?.send(JSON.stringify({
          type: 'subscribe',
          ids: allPriceIds,
        }));
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlePriceUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('Pyth WebSocket disconnected');
        this.isConnected = false;
        this.handleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('Pyth WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('Error connecting to Pyth WebSocket:', error);
    }
  }

  private disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.subscribers.size > 0) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connectWebSocket();
      }, delay);
    }
  }

  private handlePriceUpdate(data: any): void {
    try {
      if (data.type === 'price_update' && data.price_feed) {
        const priceFeed = data.price_feed;
        const priceId = priceFeed.id;

        // Find the symbol for this price ID
        const symbol = Object.entries(PYTH_PRICE_FEED_IDS).find(
          ([, id]) => id === priceId
        )?.[0] as SupportedSymbol;

        if (symbol && priceFeed.price) {
          const price = priceFeed.price;
          const emaPrice = priceFeed.ema_price || price;

          const priceData: PythPriceData = {
            symbol,
            price: parseFloat(price.price) * Math.pow(10, price.expo),
            confidence: parseFloat(price.conf) * Math.pow(10, price.expo),
            expo: price.expo,
            publishTime: price.publish_time,
            prevPublishTime: price.prev_publish_time || 0,
            emaPrice: parseFloat(emaPrice.price) * Math.pow(10, emaPrice.expo),
            emaConfidence: parseFloat(emaPrice.conf) * Math.pow(10, emaPrice.expo),
          };

          const update: PriceUpdate = {
            symbol,
            data: priceData,
            timestamp: Date.now(),
          };

          // Notify all subscribers
          this.subscribers.forEach(callback => {
            try {
              callback(update);
            } catch (error) {
              console.error('Error in subscriber callback:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling price update:', error);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Manually trigger reconnection
   */
  reconnect(): void {
    this.disconnectWebSocket();
    this.reconnectAttempts = 0;
    if (this.subscribers.size > 0) {
      this.connectWebSocket();
    }
  }

  /**
   * Clean up all connections
   */
  destroy(): void {
    this.subscribers.clear();
    this.disconnectWebSocket();
  }
}

// Export singleton instance
export const pythPriceFeedsService = new PythPriceFeedsService();
export default pythPriceFeedsService;
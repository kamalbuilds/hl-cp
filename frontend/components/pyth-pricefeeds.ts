import { HermesClient } from '@pythnetwork/hermes-client';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';

export interface PythPrice {
  symbol: string;
  price: number;
  confidence: number;
  expo: number;
  publishTime: number;
  raw: any;
}

export interface PythPriceUpdate {
  symbol: string;
  price: PythPrice;
  timestamp: number;
}

export class PythPriceFeedsService {
  private hermesClient: HermesClient;
  private priceService: PriceServiceConnection;
  private priceSubscriptions = new Map<string, Set<(update: PythPriceUpdate) => void>>();
  private latestPrices = new Map<string, PythPrice>();
  private priceIds = new Map<string, string>();

  // Mainnet price feed IDs for major crypto pairs
  private readonly PRICE_FEED_IDS = {
    'BTC': 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    'ETH': 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    'SOL': 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    'USDC': 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
    'USDT': '2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca5724ea3c9e5b2d8a3dd8b4b5e',
    'BNB': '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    'ADA': '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
    'DOGE': 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    'MATIC': '5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
    'DOT': 'ca3eed9b267293f91c5cea9e326746e623e706fac4138b5c673c8b40a2f34d42',
  };

  constructor() {
    // Initialize Hermes client for mainnet
    this.hermesClient = new HermesClient('https://hermes.pyth.network');

    // Initialize price service connection
    this.priceService = new PriceServiceConnection('https://hermes.pyth.network');

    // Set up price feed IDs
    Object.entries(this.PRICE_FEED_IDS).forEach(([symbol, priceId]) => {
      this.priceIds.set(symbol, priceId);
    });
  }

  /**
   * Get the latest price for a symbol
   */
  async getLatestPrice(symbol: string): Promise<PythPrice | null> {
    try {
      const priceId = this.priceIds.get(symbol.toUpperCase());
      if (!priceId) {
        throw new Error(`Price feed not available for symbol: ${symbol}`);
      }

      const priceFeeds = await this.hermesClient.getLatestPriceUpdates([priceId]);

      if (!priceFeeds || priceFeeds.length === 0) {
        return null;
      }

      const priceFeed = priceFeeds[0];
      const priceData = priceFeed.price;

      const pythPrice: PythPrice = {
        symbol: symbol.toUpperCase(),
        price: Number(priceData.price) * Math.pow(10, priceData.expo),
        confidence: Number(priceData.conf) * Math.pow(10, priceData.expo),
        expo: priceData.expo,
        publishTime: Number(priceData.publishTime),
        raw: priceFeed
      };

      this.latestPrices.set(symbol.toUpperCase(), pythPrice);
      return pythPrice;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get latest prices for multiple symbols
   */
  async getLatestPrices(symbols: string[]): Promise<Map<string, PythPrice>> {
    const prices = new Map<string, PythPrice>();

    try {
      const priceIds = symbols
        .map(symbol => this.priceIds.get(symbol.toUpperCase()))
        .filter(Boolean) as string[];

      if (priceIds.length === 0) {
        return prices;
      }

      const priceFeeds = await this.hermesClient.getLatestPriceUpdates(priceIds);

      priceFeeds.forEach((priceFeed, index) => {
        const symbol = symbols[index];
        const priceData = priceFeed.price;

        const pythPrice: PythPrice = {
          symbol: symbol.toUpperCase(),
          price: Number(priceData.price) * Math.pow(10, priceData.expo),
          confidence: Number(priceData.conf) * Math.pow(10, priceData.expo),
          expo: priceData.expo,
          publishTime: Number(priceData.publishTime),
          raw: priceFeed
        };

        prices.set(symbol.toUpperCase(), pythPrice);
        this.latestPrices.set(symbol.toUpperCase(), pythPrice);
      });
    } catch (error) {
      console.error('Error fetching multiple prices:', error);
    }

    return prices;
  }

  /**
   * Subscribe to price updates for a symbol
   */
  subscribeToPriceUpdates(
    symbol: string,
    callback: (update: PythPriceUpdate) => void
  ): () => void {
    const upperSymbol = symbol.toUpperCase();

    if (!this.priceSubscriptions.has(upperSymbol)) {
      this.priceSubscriptions.set(upperSymbol, new Set());
    }

    this.priceSubscriptions.get(upperSymbol)!.add(callback);

    // Start streaming for this symbol if not already started
    this.startPriceStream(upperSymbol);

    // Return unsubscribe function
    return () => {
      const subscribers = this.priceSubscriptions.get(upperSymbol);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.priceSubscriptions.delete(upperSymbol);
          // Could stop streaming here if needed
        }
      }
    };
  }

  /**
   * Start price streaming for a symbol
   */
  private async startPriceStream(symbol: string): Promise<void> {
    const priceId = this.priceIds.get(symbol);
    if (!priceId) {
      return;
    }

    try {
      // Use polling approach since WebSocket streaming might not be available
      const pollInterval = setInterval(async () => {
        const price = await this.getLatestPrice(symbol);
        if (price) {
          const update: PythPriceUpdate = {
            symbol,
            price,
            timestamp: Date.now()
          };

          // Notify all subscribers
          const subscribers = this.priceSubscriptions.get(symbol);
          if (subscribers) {
            subscribers.forEach(callback => callback(update));
          }
        }
      }, 1000); // Update every second

      // Store interval for cleanup (in a real implementation)
      // You might want to store this in a map for proper cleanup
    } catch (error) {
      console.error(`Error starting price stream for ${symbol}:`, error);
    }
  }

  /**
   * Get cached price if available
   */
  getCachedPrice(symbol: string): PythPrice | null {
    return this.latestPrices.get(symbol.toUpperCase()) || null;
  }

  /**
   * Get all available symbols
   */
  getAvailableSymbols(): string[] {
    return Array.from(this.priceIds.keys());
  }

  /**
   * Calculate confidence interval for a price
   */
  getConfidenceInterval(price: PythPrice, confidenceLevel: number = 0.95): {
    lower: number;
    upper: number;
    percentage: number;
  } {
    const confidenceMultiplier = confidenceLevel === 0.95 ? 1.96 :
                                confidenceLevel === 0.99 ? 2.58 : 1.96;

    const margin = price.confidence * confidenceMultiplier;
    const percentage = (price.confidence / price.price) * 100;

    return {
      lower: price.price - margin,
      upper: price.price + margin,
      percentage
    };
  }

  /**
   * Format price with appropriate decimals
   */
  formatPrice(price: number, symbol: string): string {
    const decimals = symbol === 'BTC' ? 2 :
                    symbol === 'ETH' ? 2 :
                    symbol === 'SOL' ? 3 :
                    ['USDC', 'USDT'].includes(symbol) ? 4 : 4;

    return price.toFixed(decimals);
  }

  /**
   * Check if price data is stale
   */
  isPriceStale(price: PythPrice, maxAgeMs: number = 30000): boolean {
    const now = Date.now() / 1000; // Convert to seconds
    return (now - price.publishTime) > (maxAgeMs / 1000);
  }

  /**
   * Cleanup subscriptions and connections
   */
  cleanup(): void {
    this.priceSubscriptions.clear();
    this.latestPrices.clear();
    // Additional cleanup if needed
  }
}

// Export singleton instance
export const pythPriceFeedsService = new PythPriceFeedsService();
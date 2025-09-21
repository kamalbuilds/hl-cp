'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { Position, Trade, Trader, CopyTradeSettings } from '@/types';

export interface UseCopyTradingOptions {
  onTradeReceived?: (trade: Trade) => void;
  onPositionUpdate?: (position: Position) => void;
  onError?: (error: string) => void;
}

export function useCopyTrading(options: UseCopyTradingOptions = {}) {
  const { onTradeReceived, onPositionUpdate, onError } = options;

  const [activeCopies, setActiveCopies] = useState<CopyTradeSettings[]>([]);
  const [realtimePositions, setRealtimePositions] = useState<Position[]>([]);
  const [isListening, setIsListening] = useState(false);

  const { isConnected, sendMessage, subscribe, unsubscribe } = useWebSocket(
    undefined,
    {
      onMessage: (message) => {
        handleWebSocketMessage(message.data);
      },
      onError: (error) => {
        onError?.('WebSocket connection error');
      },
    }
  );

  const handleWebSocketMessage = useCallback((data: any) => {
    try {
      switch (data.type) {
        case 'trade':
          handleTradeMessage(data);
          break;
        case 'position_update':
          handlePositionUpdate(data);
          break;
        case 'trader_update':
          handleTraderUpdate(data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      onError?.('Failed to process real-time data');
    }
  }, [onTradeReceived, onPositionUpdate, onError]);

  const handleTradeMessage = useCallback((data: any) => {
    const trade: Trade = {
      id: data.id,
      traderId: data.trader_id,
      symbol: data.symbol,
      side: data.side,
      size: data.size,
      price: data.price,
      timestamp: data.timestamp,
      type: data.type,
      status: data.status,
    };

    onTradeReceived?.(trade);

    // Check if we should copy this trade
    const copySettings = activeCopies.find(copy =>
      copy.traderId === trade.traderId &&
      copy.isActive &&
      copy.enabledSymbols.includes(trade.symbol)
    );

    if (copySettings) {
      copyTrade(trade, copySettings);
    }
  }, [activeCopies, onTradeReceived]);

  const handlePositionUpdate = useCallback((data: any) => {
    const position: Position = {
      id: data.id,
      traderId: data.trader_id,
      symbol: data.symbol,
      side: data.side,
      size: data.size,
      entryPrice: data.entry_price,
      currentPrice: data.current_price,
      unrealizedPnL: data.unrealized_pnl,
      leverage: data.leverage,
      timestamp: data.timestamp,
      status: data.status,
      exitPrice: data.exit_price,
      realizedPnL: data.realized_pnl,
    };

    setRealtimePositions(prev => {
      const index = prev.findIndex(p => p.id === position.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = position;
        return updated;
      } else {
        return [...prev, position];
      }
    });

    onPositionUpdate?.(position);
  }, [onPositionUpdate]);

  const handleTraderUpdate = useCallback((data: any) => {
    // Handle trader statistics updates
    console.log('Trader update:', data);
  }, []);

  const copyTrade = useCallback(async (trade: Trade, settings: CopyTradeSettings) => {
    try {
      // Calculate position size based on allocation and risk multiplier
      const adjustedSize = calculatePositionSize(trade, settings);

      // Send copy trade request to backend
      const response = await fetch('/api/copy-trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalTrade: trade,
          copySettings: settings,
          adjustedSize,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute copy trade');
      }

      const result = await response.json();
      console.log('Copy trade executed:', result);
    } catch (error) {
      console.error('Copy trade error:', error);
      onError?.(`Failed to copy trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [onError]);

  const calculatePositionSize = (trade: Trade, settings: CopyTradeSettings): number => {
    // Simple position sizing logic
    // In production, this would consider account balance, risk management, etc.
    let adjustedSize = trade.size * (settings.riskMultiplier / 10000);

    if (adjustedSize > settings.maxPositionSize) {
      adjustedSize = settings.maxPositionSize;
    }

    return adjustedSize;
  };

  const startCopyTrading = useCallback((copySettings: CopyTradeSettings[]) => {
    setActiveCopies(copySettings);

    // Subscribe to traders' feeds
    copySettings.forEach(settings => {
      subscribe(`trader:${settings.traderId}`, {
        symbols: settings.enabledSymbols,
      });
    });

    setIsListening(true);
  }, [subscribe]);

  const stopCopyTrading = useCallback(() => {
    // Unsubscribe from all trader feeds
    activeCopies.forEach(settings => {
      unsubscribe(`trader:${settings.traderId}`);
    });

    setActiveCopies([]);
    setIsListening(false);
  }, [activeCopies, unsubscribe]);

  const addCopySettings = useCallback((settings: CopyTradeSettings) => {
    setActiveCopies(prev => {
      const existing = prev.find(copy => copy.traderId === settings.traderId);
      if (existing) {
        // Update existing settings
        return prev.map(copy =>
          copy.traderId === settings.traderId ? settings : copy
        );
      } else {
        // Add new settings
        return [...prev, settings];
      }
    });

    // Subscribe to the trader's feed
    if (settings.isActive) {
      subscribe(`trader:${settings.traderId}`, {
        symbols: settings.enabledSymbols,
      });
    }
  }, [subscribe]);

  const removeCopySettings = useCallback((traderId: string) => {
    setActiveCopies(prev => prev.filter(copy => copy.traderId !== traderId));
    unsubscribe(`trader:${traderId}`);
  }, [unsubscribe]);

  const updateCopySettings = useCallback((traderId: string, updates: Partial<CopyTradeSettings>) => {
    setActiveCopies(prev =>
      prev.map(copy =>
        copy.traderId === traderId
          ? { ...copy, ...updates }
          : copy
      )
    );
  }, []);

  // Subscribe to general market data on mount
  useEffect(() => {
    if (isConnected) {
      subscribe('market_data', {
        symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD'], // Major symbols for price updates
      });
    }
  }, [isConnected, subscribe]);

  return {
    // State
    activeCopies,
    realtimePositions,
    isListening,
    isConnected,

    // Actions
    startCopyTrading,
    stopCopyTrading,
    addCopySettings,
    removeCopySettings,
    updateCopySettings,

    // Utils
    calculatePositionSize,
  };
}
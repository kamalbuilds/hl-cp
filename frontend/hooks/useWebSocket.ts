'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_CONFIG } from '@/utils/constants';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(url?: string, options: UseWebSocketOptions = {}) {
  const {
    reconnectInterval = WS_CONFIG.RECONNECT_INTERVAL,
    maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsUrl = url || WS_CONFIG.URL;

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to:', wsUrl);
        setIsConnected(true);
        setReconnectAttempts(0);
        onOpen?.();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();

        // Attempt to reconnect if not at max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = {
            type: 'message',
            data: JSON.parse(event.data),
            timestamp: Date.now(),
          };
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [wsUrl, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onOpen, onClose, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setReconnectAttempts(0);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket not connected, unable to send message');
    return false;
  }, []);

  const subscribe = useCallback((channel: string, params?: any) => {
    return sendMessage({
      method: 'subscribe',
      params: {
        channel,
        ...params,
      },
    });
  }, [sendMessage]);

  const unsubscribe = useCallback((channel: string) => {
    return sendMessage({
      method: 'unsubscribe',
      params: {
        channel,
      },
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
  };
}
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DEBRIDGE_CONFIG } from '@/utils/constants';
import { BridgeQuote, ChainAsset } from '@/types';

interface DeBridgeWidgetProps {
  destinationChainId?: number;
  destinationTokenAddress?: string;
  amount?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

declare global {
  interface Window {
    deBridge?: {
      widget: {
        create: (config: any) => void;
        on: (event: string, callback: Function) => void;
      };
    };
  }
}

export function DeBridgeWidget({
  destinationChainId = 998, // HyperEVM
  destinationTokenAddress = '0x0000000000000000000000000000000000000000', // ETH
  amount,
  onSuccess,
  onError,
  className = '',
}: DeBridgeWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bridgeQuote, setBridgeQuote] = useState<BridgeQuote | null>(null);

  useEffect(() => {
    const loadDeBridgeWidget = async () => {
      try {
        // Load deBridge widget script if not already loaded
        if (!window.deBridge) {
          const script = document.createElement('script');
          script.src = 'https://app.dln.trade/widget/widget.js';
          script.async = true;
          script.onload = () => initializeWidget();
          script.onerror = () => {
            setError('Failed to load deBridge widget');
            setIsLoading(false);
          };
          document.head.appendChild(script);
        } else {
          initializeWidget();
        }
      } catch (err) {
        setError('Failed to initialize bridge widget');
        setIsLoading(false);
      }
    };

    const initializeWidget = () => {
      if (!window.deBridge || !widgetRef.current) {
        setError('Widget initialization failed');
        setIsLoading(false);
        return;
      }

      try {
        window.deBridge.widget.create({
          element: widgetRef.current,
          title: 'Bridge to HyperEVM',
          theme: 'dark', // or 'light'
          src: {
            chainId: null, // Auto-detect source chain
            chainName: null,
            tokenAddress: null,
          },
          dst: {
            chainId: destinationChainId,
            chainName: 'HyperEVM',
            tokenAddress: destinationTokenAddress,
          },
          amount: amount || '',
          showSwapTransfer: true,
          showAdvancedSettings: false,
          showBrandFooter: false,
          lang: 'en',
          mode: 'widget', // or 'popup'
          styles: {
            borderRadius: '12px',
            primaryColor: '#0ea5e9',
            backgroundColor: '#1f2937',
            color: '#ffffff',
          },
        });

        // Listen for widget events
        window.deBridge.widget.on('success', (data: any) => {
          console.log('Bridge transaction successful:', data);
          onSuccess?.(data.txHash);
        });

        window.deBridge.widget.on('error', (error: any) => {
          console.error('Bridge transaction failed:', error);
          onError?.(error.message || 'Bridge transaction failed');
        });

        window.deBridge.widget.on('quote', (quote: any) => {
          console.log('Bridge quote received:', quote);
          setBridgeQuote(quote);
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Widget creation failed:', err);
        setError('Failed to create bridge widget');
        setIsLoading(false);
      }
    };

    loadDeBridgeWidget();

    return () => {
      // Cleanup if needed
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }
    };
  }, [destinationChainId, destinationTokenAddress, amount, onSuccess, onError]);

  const getBridgeQuote = async (
    srcChainId: number,
    dstChainId: number,
    srcTokenAddress: string,
    dstTokenAddress: string,
    amount: string
  ): Promise<BridgeQuote | null> => {
    try {
      const response = await fetch(
        `${DEBRIDGE_CONFIG.API_URL}/dln/order/quote?` +
        new URLSearchParams({
          srcChainId: srcChainId.toString(),
          srcChainTokenIn: srcTokenAddress,
          srcChainTokenInAmount: amount,
          dstChainId: dstChainId.toString(),
          dstChainTokenOut: dstTokenAddress,
          prependOperatingExpense: 'false',
        })
      );

      if (!response.ok) {
        throw new Error('Failed to get bridge quote');
      }

      const data = await response.json();
      return {
        srcChainId,
        dstChainId,
        srcTokenAddress,
        dstTokenAddress,
        amount,
        estimatedTime: data.estimation?.estimatedTime || 300, // 5 minutes default
        fees: {
          protocol: data.fixFee || '0',
          bridge: data.percentFee || '0',
          gas: data.estimation?.srcChainTokenIn?.maxTheoreticalAmount || '0',
        },
      };
    } catch (error) {
      console.error('Failed to get bridge quote:', error);
      return null;
    }
  };

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-danger-100 dark:bg-danger-900 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bridge Widget Error</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Bridge Widget</h3>
          <p className="text-gray-500 dark:text-gray-400">Initializing cross-chain bridge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bridge Assets to HyperEVM
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Transfer assets from any supported chain to start copy trading
        </p>
      </div>

      <div ref={widgetRef} className="min-h-[400px]">
        {/* deBridge widget will be rendered here */}
      </div>

      {bridgeQuote && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Estimated Time:</span>
              <span className="text-gray-900 dark:text-white">
                ~{Math.ceil(bridgeQuote.estimatedTime / 60)} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Bridge Fee:</span>
              <span className="text-gray-900 dark:text-white">
                {bridgeQuote.fees.bridge} + Gas
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Alternative manual bridge component for when widget fails
export function ManualBridge({ className = '' }: { className?: string }) {
  const [sourceChain, setSourceChain] = useState('1'); // Ethereum
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supportedChains = [
    { id: '1', name: 'Ethereum', symbol: 'ETH' },
    { id: '42161', name: 'Arbitrum', symbol: 'ETH' },
    { id: '10', name: 'Optimism', symbol: 'ETH' },
    { id: '137', name: 'Polygon', symbol: 'MATIC' },
    { id: '56', name: 'BSC', symbol: 'BNB' },
  ];

  const handleBridge = async () => {
    if (!amount || isLoading) return;

    setIsLoading(true);
    try {
      // Open deBridge app in new tab with pre-filled parameters
      const bridgeUrl = new URL('https://app.dln.trade');
      bridgeUrl.searchParams.set('srcChainId', sourceChain);
      bridgeUrl.searchParams.set('dstChainId', '998'); // HyperEVM
      bridgeUrl.searchParams.set('amount', amount);

      window.open(bridgeUrl.toString(), '_blank');
    } catch (error) {
      console.error('Failed to open bridge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Cross-Chain Bridge
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bridge your assets to HyperEVM to start copy trading
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Chain
          </label>
          <select
            value={sourceChain}
            onChange={(e) => setSourceChain(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {supportedChains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">To:</span>
            <span className="text-gray-900 dark:text-white font-medium">HyperEVM (ETH)</span>
          </div>
        </div>

        <Button
          onClick={handleBridge}
          loading={isLoading}
          disabled={!amount}
          className="w-full"
        >
          Open Bridge
        </Button>
      </div>
    </div>
  );
}
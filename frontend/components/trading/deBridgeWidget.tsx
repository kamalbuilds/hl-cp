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
      widget: (config: any) => Promise<any> | any;
    };
  }
}

export function DeBridgeWidget({
  destinationChainId = 999, // HyperEVM chain ID 999 as per the example
  destinationTokenAddress = '',
  amount,
  onSuccess,
  onError,
  className = '',
}: DeBridgeWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bridgeQuote, setBridgeQuote] = useState<BridgeQuote | null>(null);
  const [widgetId] = useState(`debridgeWidget_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const loadDeBridgeWidget = async () => {
      try {
        // Check if widget is already loaded
        if (window.deBridge?.widget) {
          initializeWidget();
          return;
        }

        // Load deBridge widget script
        const script = document.createElement('script');
        script.src = 'https://app.debridge.finance/assets/scripts/widget.js';
        script.async = true;

        const timeoutId = setTimeout(() => {
          setError('Widget loading timeout - trying alternative approach');
          script.remove();
          setIsLoading(false);
        }, 10000); // 10 second timeout

        script.onload = () => {
          clearTimeout(timeoutId);
          // Wait a bit for the widget to fully initialize
          setTimeout(() => {
            if (window.deBridge?.widget) {
              initializeWidget();
            } else {
              console.warn('Widget script loaded but deBridge.widget not available, retrying...');
              setTimeout(initializeWidget, 1000);
            }
          }, 500);
        };

        script.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error('Failed to load deBridge widget script:', error);
          setError('Failed to load widget script');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading deBridge widget:', err);
        setError('Error loading widget');
        setIsLoading(false);
      }
    };

    const tryAlternativeWidget = () => {
      // Try alternative CDN or fallback to manual bridge
      console.log('Trying alternative widget loading...');

      const alternativeScript = document.createElement('script');
      alternativeScript.src = 'https://cdn.debridge.finance/widget/widget.js';
      alternativeScript.async = true;
      alternativeScript.onload = () => {
        setTimeout(initializeWidget, 500);
      };
      alternativeScript.onerror = () => {
        console.warn('Alternative widget also failed, showing manual bridge');
        setError('Widget unavailable - using manual bridge mode');
        setIsLoading(false);
      };

      document.head.appendChild(alternativeScript);
    };

    const initializeWidget = () => {
      if (!window.deBridge?.widget || !widgetRef.current) {
        console.warn('Widget API not available, retrying in 1 second...');
        setTimeout(() => {
          if (window.deBridge?.widget) {
            initializeWidget();
          } else {
            setError('Widget initialization failed - API not available');
            setIsLoading(false);
          }
        }, 1000);
        return;
      }

      try {
        // Use the exact initialization format from the working example
        const widgetConfig = {
          "v": "1",
          "element": widgetId, // Use the unique widget ID
          "title": "HyperMirror 🪞",
          "description": "Bridge to HyperEVM",
          "width": "100%",
          "height": "auto",
          "r": 16090,
          "supportedChains": JSON.stringify({
            "inputChains": {
              "1": "all",
              "10": "all",
              "56": "all",
              "137": "all",
              "8453": "all",
              "42161": "all",
              "43114": "all",
              "59144": "all",
              "7565164": "all",
              "245022934": "all",
              "81457": "all",
            },
            "outputChains": {
              "999": "all", // HyperEVM mainnet
            }
          }),
          "inputChain": 42161, // Default to Arbitrum as shown in example
          "outputChain": destinationChainId || 999,
          "inputCurrency": "",
          "outputCurrency": destinationTokenAddress || "",
          "address": "",
          "showSwapTransfer": true,
          "amount": amount || "",
          "outputAmount": "",
          "isAmountFromNotModifiable": false,
          "isAmountToNotModifiable": false,
          "lang": "en",
          "mode": "deswap",
          "isEnableCalldata": false,
          "hideSelectionFrom": false,
          "hideSelectionTo": false,
          "allowedSlippage": 1,
          "feePercent": 0,
          "referralCode": "",
          "hostDomain": window.location.origin,
          "primaryColor": "288",
          "secondaryColor": "17",
          "textColor": "100",
          "backgroundColor": "7",
          "borderRadius": 8,
          "theme": "dark",
          "affiliateFeePercent": 0,
          "affiliateFeeRecipient": ""
        };

        // Call the widget method directly as shown in the working example
        console.log('Initializing deBridge widget with config:', widgetConfig);
        const widgetResult = window.deBridge.widget(widgetConfig);

        // Handle the widget result if it returns a promise
        if (widgetResult && typeof widgetResult.then === 'function') {
          widgetResult
            .then((result: any) => {
              console.log('Widget initialized successfully:', result);
              setIsLoading(false);
            })
            .catch((error: any) => {
              console.error('Widget initialization failed:', error);
              setError('Failed to initialize widget');
              setIsLoading(false);
            });
        } else {
          // Widget doesn't return a promise, assume it's initialized
          console.log('Widget initialized (synchronous)');
          setIsLoading(false);
        }

        // Set up event listeners if available
        if (window.deBridge?.on) {
          window.deBridge.on('success', (data: any) => {
            console.log('Bridge transaction successful:', data);
            onSuccess?.(data.txHash || data.transactionHash || data.hash);
          });

          window.deBridge.on('error', (error: any) => {
            console.error('Bridge transaction failed:', error);
            const errorMessage = error?.message || error?.toString() || 'Bridge transaction failed';
            onError?.(errorMessage);
          });
        }
      } catch (err) {
        console.error('Widget creation failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to create bridge widget';
        setError(errorMessage);
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
    // Show manual bridge instead of just an error
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bridge Assets to HyperEVM
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                Widget unavailable - using manual bridge mode
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Retry loading the widget
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
            >
              Retry Widget
            </Button>
          </div>
        </div>
        <ManualBridge />
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

      <div id={widgetId} ref={widgetRef} className="min-h-[400px]">
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
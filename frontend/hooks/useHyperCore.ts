'use client';

import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits, encodeAbiParameters } from 'viem';
import { useState, useEffect } from 'react';

// HyperCore precompile addresses
const PRECOMPILE_ADDRESSES = {
  POSITION: '0x0000000000000000000000000000000000000800',
  SPOT_BALANCE: '0x0000000000000000000000000000000000000801',
  VAULT_EQUITY: '0x0000000000000000000000000000000000000802',
  ORACLE_PRICE: '0x0000000000000000000000000000000000000807',
  BBO: '0x000000000000000000000000000000000000080e',
  MARGIN_SUMMARY: '0x000000000000000000000000000000000000080F',
};

// CoreWriter address
const CORE_WRITER_ADDRESS = '0x3333333333333333333333333333333333333333';

// Asset indices for common markets
export const ASSET_INDICES = {
  'BTC-USD': 0,
  'ETH-USD': 1,
  'SOL-USD': 2,
  'ARB-USD': 3,
  'MATIC-USD': 4,
  'AVAX-USD': 5,
  'BNB-USD': 6,
  'APT-USD': 7,
  'DOGE-USD': 8,
  'LTC-USD': 9,
};

// TIF (Time in Force) values
export enum TIF {
  ALO = 1,  // Add Liquidity Only
  GTC = 2,  // Good Till Cancel
  IOC = 3,  // Immediate or Cancel
}

// Hook to get trader's position on HyperCore
export function useHyperCorePosition(address: string, perpIndex: number) {
  return useContractRead({
    address: PRECOMPILE_ADDRESSES.POSITION as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'user', type: 'address' },
          { name: 'perp', type: 'uint16' },
        ],
        name: 'position',
        outputs: [
          {
            components: [
              { name: 'szi', type: 'int64' },
              { name: 'entryNtl', type: 'uint64' },
              { name: 'isolatedRawUsd', type: 'int64' },
              { name: 'leverage', type: 'uint32' },
              { name: 'isIsolated', type: 'bool' },
            ],
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'position',
    args: [address as `0x${string}`, perpIndex],
    enabled: !!address,
  });
}

// Hook to get oracle price
export function useOraclePrice(assetIndex: number) {
  const { data, refetch } = useContractRead({
    address: PRECOMPILE_ADDRESSES.ORACLE_PRICE as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'index', type: 'uint32' }],
        name: 'oraclePx',
        outputs: [{ name: '', type: 'uint64' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'oraclePx',
    args: [assetIndex],
  });

  // Convert price to human-readable format
  const price = data ? Number(data) / 1e8 : 0;

  // Auto-refresh price every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return { price, rawPrice: data };
}

// Hook to get best bid/offer
export function useBestBidOffer(assetIndex: number) {
  const { data, refetch } = useContractRead({
    address: PRECOMPILE_ADDRESSES.BBO as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'asset', type: 'uint32' }],
        name: 'bbo',
        outputs: [
          {
            components: [
              { name: 'bid', type: 'uint64' },
              { name: 'ask', type: 'uint64' },
            ],
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'bbo',
    args: [assetIndex],
  });

  // Auto-refresh BBO every 500ms for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 500);

    return () => clearInterval(interval);
  }, [refetch]);

  const bid = data ? Number(data.bid) / 1e8 : 0;
  const ask = data ? Number(data.ask) / 1e8 : 0;
  const spread = ask - bid;
  const spreadPercent = bid > 0 ? (spread / bid) * 100 : 0;

  return { bid, ask, spread, spreadPercent, rawData: data };
}

// Hook to place a limit order on HyperCore
export function usePlaceLimitOrder() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: CORE_WRITER_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'data', type: 'bytes' }],
        name: 'sendRawAction',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'sendRawAction',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const placeLimitOrder = (
    asset: string,
    isBuy: boolean,
    price: number,
    size: number,
    reduceOnly: boolean = false,
    tif: TIF = TIF.GTC,
    cloid?: number
  ) => {
    const assetIndex = ASSET_INDICES[asset];
    if (assetIndex === undefined) {
      throw new Error(`Unknown asset: ${asset}`);
    }

    // Convert price and size to HyperCore format (multiply by 1e8)
    const limitPx = BigInt(Math.floor(price * 1e8));
    const sz = BigInt(Math.floor(size * 1e8));
    const clientOrderId = cloid || Math.floor(Math.random() * 1e10);

    // Encode the action (Action ID 1: Limit Order)
    const encodedAction = encodeOrderAction(
      assetIndex,
      isBuy,
      limitPx,
      sz,
      reduceOnly,
      tif,
      BigInt(clientOrderId)
    );

    write?.({ args: [encodedAction as `0x${string}`] });
  };

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    placeLimitOrder,
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}

// Hook to cancel an order
export function useCancelOrder() {
  const { write, data, isLoading, error } = useContractWrite({
    address: CORE_WRITER_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [{ name: 'data', type: 'bytes' }],
        name: 'sendRawAction',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'sendRawAction',
  });

  const cancelOrderByCloid = (asset: string, cloid: number) => {
    const assetIndex = ASSET_INDICES[asset];
    if (assetIndex === undefined) {
      throw new Error(`Unknown asset: ${asset}`);
    }

    // Encode cancel order action (Action ID 11)
    const encodedAction = encodeCancelOrderAction(assetIndex, BigInt(cloid));
    write?.({ args: [encodedAction as `0x${string}`] });
  };

  return {
    cancelOrderByCloid,
    isLoading,
    error,
  };
}

// Hook to get account margin summary
export function useAccountMargin(address: string, perpDexIndex: number = 0) {
  const { data, refetch } = useContractRead({
    address: PRECOMPILE_ADDRESSES.MARGIN_SUMMARY as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'perp_dex_index', type: 'uint32' },
          { name: 'user', type: 'address' },
        ],
        name: 'accountMarginSummary',
        outputs: [
          {
            components: [
              { name: 'accountValue', type: 'int64' },
              { name: 'marginUsed', type: 'uint64' },
              { name: 'ntlPos', type: 'uint64' },
              { name: 'rawUsd', type: 'int64' },
            ],
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'accountMarginSummary',
    args: [perpDexIndex, address as `0x${string}`],
    enabled: !!address,
  });

  // Auto-refresh margin every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 2000);

    return () => clearInterval(interval);
  }, [refetch]);

  const accountValue = data ? Number(data.accountValue) / 1e8 : 0;
  const marginUsed = data ? Number(data.marginUsed) / 1e8 : 0;
  const freeMargin = accountValue - marginUsed;
  const marginRatio = accountValue > 0 ? (marginUsed / accountValue) * 100 : 0;

  return {
    accountValue,
    marginUsed,
    freeMargin,
    marginRatio,
    rawData: data,
  };
}

// Helper function to encode order action
function encodeOrderAction(
  asset: number,
  isBuy: boolean,
  limitPx: bigint,
  sz: bigint,
  reduceOnly: boolean,
  tif: TIF,
  cloid: bigint
): string {
  try {
    // Encode the order parameters using viem's encodeAbiParameters
    const encodedParams = encodeAbiParameters(
      [
        { type: 'uint32', name: 'asset' },
        { type: 'bool', name: 'isBuy' },
        { type: 'uint64', name: 'limitPx' },
        { type: 'uint64', name: 'sz' },
        { type: 'bool', name: 'reduceOnly' },
        { type: 'uint8', name: 'tif' },
        { type: 'uint128', name: 'cloid' },
      ],
      [asset, isBuy, limitPx, sz, reduceOnly, tif, cloid]
    );

    // Prepend version and action ID
    const header = '0x01000001'; // Version 1, Action ID 1 (Limit Order)
    return header + encodedParams.slice(2); // Remove '0x' from encoded params
  } catch (error) {
    console.error('Error encoding order action:', error);
    throw new Error('Failed to encode order action');
  }
}

// Helper function to encode cancel order action
function encodeCancelOrderAction(asset: number, cloid: bigint): string {
  try {
    // Encode the cancel order parameters using viem's encodeAbiParameters
    const encodedParams = encodeAbiParameters(
      [
        { type: 'uint32', name: 'asset' },
        { type: 'uint128', name: 'cloid' },
      ],
      [asset, cloid]
    );

    // Prepend version and action ID
    const header = '0x0100000B'; // Version 1, Action ID 11 (cancel by cloid)
    return header + encodedParams.slice(2); // Remove '0x' from encoded params
  } catch (error) {
    console.error('Error encoding cancel order action:', error);
    throw new Error('Failed to encode cancel order action');
  }
}

// Note: Custom ABI encoder removed - now using viem's encodeAbiParameters for proper ABI encoding
'use client';

import { useContractRead, useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';
import { CopyTradingABI } from '@/contracts/abi';
import { getContractAddress } from '@/contracts/addresses';
import { parseEther } from 'viem';
import { useState, useEffect } from 'react';

// Hook to get trader info
export function useTraderInfo(traderAddress: string) {
  const chainId = 31337; // Local hardhat for now

  return useContractRead({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'getTraderInfo',
    args: [traderAddress as `0x${string}`],
    enabled: !!traderAddress,
  });
}

// Hook to get trader stats
export function useTraderStats(traderAddress: string) {
  const chainId = 31337;

  return useContractRead({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'getTraderStats',
    args: [traderAddress as `0x${string}`],
    enabled: !!traderAddress,
  });
}

// Hook to get all traders
export function useAllTraders() {
  const chainId = 31337;

  return useContractRead({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'getAllTraders',
  });
}

// Hook to register as trader
export function useRegisterTrader() {
  const chainId = 31337;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'registerAsTrader',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    register: (
      name: string,
      bio: string,
      performanceFee: number,
      twitter: string,
      telegram: string,
      discord: string
    ) => {
      write({
        args: [name, bio, BigInt(performanceFee), twitter, telegram, discord],
      });
    },
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}

// Hook to start copying a trader
export function useStartCopying() {
  const chainId = 31337;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'startCopying',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    startCopying: (traderAddress: string, amount: string) => {
      write({
        args: [traderAddress as `0x${string}`],
        value: parseEther(amount),
      });
    },
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}

// Hook to stop copying a trader
export function useStopCopying() {
  const chainId = 31337;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'stopCopying',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    stopCopying: (traderAddress: string) => {
      write({
        args: [traderAddress as `0x${string}`],
      });
    },
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}

// Hook to update trader settings
export function useUpdateTraderSettings() {
  const chainId = 31337;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'updateTraderSettings',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    updateSettings: (
      name: string,
      bio: string,
      performanceFee: number,
      minCopyAmount: string,
      maxCopyAmount: string,
      twitter: string,
      telegram: string,
      discord: string
    ) => {
      write({
        args: [
          name,
          bio,
          BigInt(performanceFee),
          parseEther(minCopyAmount),
          parseEther(maxCopyAmount),
          twitter,
          telegram,
          discord,
        ],
      });
    },
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}

// Hook to get copiers of a trader
export function useCopiers(traderAddress: string) {
  const chainId = 31337;

  return useContractRead({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'getCopiers',
    args: [traderAddress as `0x${string}`],
    enabled: !!traderAddress,
  });
}

// Hook to open a position (for traders)
export function useOpenPosition() {
  const chainId = 31337;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'openPosition',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    openPosition: (
      market: string,
      isLong: boolean,
      size: string,
      entryPrice: string
    ) => {
      write({
        args: [
          market,
          isLong,
          parseEther(size),
          parseEther(entryPrice),
        ],
      });
    },
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}

// Hook to close a position
export function useClosePosition() {
  const chainId = 31337;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { write, data, isLoading, error } = useContractWrite({
    address: getContractAddress(chainId, 'CopyTrading') as `0x${string}`,
    abi: CopyTradingABI,
    functionName: 'closePosition',
  });

  const { isLoading: isWaiting, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (data?.hash) {
      setTxHash(data.hash);
    }
  }, [data]);

  return {
    closePosition: (positionId: number, pnl: string) => {
      const pnlValue = parseFloat(pnl);
      const pnlBigInt = BigInt(Math.floor(pnlValue * 1e18));

      write({
        args: [BigInt(positionId), pnlBigInt],
      });
    },
    isLoading: isLoading || isWaiting,
    isSuccess,
    error,
    txHash,
  };
}
'use client';

import React, { ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import {
  mainnet,
  base,
  avalanche,
  arbitrum,
  optimism,
  polygon,
  bsc,
  linea,
  fantom,
} from 'wagmi/chains';

// Define Hyperliquid chain
const hyperliquid = {
  id: 999,
  name: 'Hyperliquid',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://api.hyperliquid.xyz/evm'] },
    public: { http: [process.env.NEXT_PUBLIC_HYPEREVM_RPC_URL || 'https://api.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'Hyperliquid Scan', url: 'https://explorer.hyperliquid.xyz' },
  },
};

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local');
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    base,
    avalanche,
    arbitrum,
    optimism,
    polygon,
    bsc,
    linea,
    fantom,
    hyperliquid,
  ],
  [
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'HyperMirror',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});


const queryClient = new QueryClient();

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: '#0ea5e9',
            accentColorForeground: 'white',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

// Keeping useWallet hook for compatibility if it's used elsewhere, though it's now empty.
import { useContext, createContext } from 'react';
const WalletContext = createContext({});
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
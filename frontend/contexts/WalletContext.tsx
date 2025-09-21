'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { SUPPORTED_CHAINS } from '@/utils/constants';

// Define HyperEVM chain
const hyperEVM = {
  id: 998,
  name: 'HyperEVM',
  network: 'hyperevm',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://api.hyperliquid-testnet.xyz/evm'] },
    default: { http: ['https://api.hyperliquid-testnet.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid-testnet.xyz' },
  },
  testnet: true,
} as const;

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hyperEVM, arbitrum, mainnet],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '' }),
    publicProvider(),
  ]
);

// Configure wallet connectors
const { wallets } = getDefaultWallets({
  appName: 'Hyperliquid Copy Trading',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      {
        name: 'Injected',
        iconUrl: '',
        iconBackground: '#fff',
        createConnector: () => ({
          connector: new InjectedConnector({ chains }),
        }),
      },
    ],
  },
]);

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

interface WalletContextType {
  // Add any additional wallet-related state or functions here
}

const WalletContext = createContext<WalletContextType>({});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={{
          lightMode: {
            colors: {
              accentColor: '#0ea5e9',
              accentColorForeground: '#ffffff',
            },
          },
          darkMode: {
            colors: {
              accentColor: '#0ea5e9',
              accentColorForeground: '#ffffff',
            },
          },
        }}
      >
        <WalletContext.Provider value={{}}>
          {children}
        </WalletContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import { SUPPORTED_CHAINS } from '@/utils/constants';

// Define HyperEVM chain
const hyperEVM = {
  id: 998,
  name: 'HyperEVM Testnet',
  network: 'hyperevm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
    default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperliquid-testnet.xyz' },
  },
  testnet: true,
} as const;


// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hyperEVM, arbitrum],
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
        id: 'injected',
        name: 'Injected',
        iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEuNSA0LjVhMyAzIDAgMDEzLTNoMjNhMyAzIDAgMDEzIDN2MjNhMyAzIDAgMDEtMyAzaC0yM2EzIDMgMCAwMS0zLTNWNC41eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPgo=',
        iconBackground: '#333333',
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
        theme={darkTheme({
          accentColor: '#0ea5e9',
          accentColorForeground: 'white',
        })}
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
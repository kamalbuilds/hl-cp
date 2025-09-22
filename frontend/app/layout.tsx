import { Inter } from 'next/font/google';
import { WalletProvider } from '@/contexts/WalletContext';
import { RootLayout as Layout } from '@/components/layout/RootLayout';
import './globals.css';
import "@rainbow-me/rainbowkit/styles.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HyperMirror - Mirror the Masters, Multiply Your Success',
  description: 'Revolutionary cross-chain copy trading on HyperEVM. Instantly mirror elite traders with advanced risk management and seamless deBridge integration.',
  keywords: 'copy trading, HyperEVM, Hyperliquid, deBridge, cross-chain, DeFi, trading',
  authors: [{ name: 'HyperMirror Team' }],
  openGraph: {
    title: 'HyperMirror - Cross-Chain Copy Trading',
    description: 'Mirror the Masters, Multiply Your Success',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        <WalletProvider>
          <Layout>
            {children}
          </Layout>
        </WalletProvider>
      </body>
    </html>
  );
}
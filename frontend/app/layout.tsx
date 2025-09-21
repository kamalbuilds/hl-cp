import { Inter } from 'next/font/google';
import { WalletProvider } from '@/contexts/WalletContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Hyperliquid Copy Trading Platform',
  description: 'Cross-chain copy trading platform for Hyperliquid hackathon',
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
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
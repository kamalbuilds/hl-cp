'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import {
  Users, LayoutDashboard, ArrowRightLeft, UserCircle,
  Settings, TrendingUp, Home
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Navigation() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/traders', label: 'Traders', icon: Users },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/test-widget', label: 'Bridge', icon: ArrowRightLeft },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Trader-specific links */}
            {isConnected && (
              <>
                <Link
                  href="/dashboard/trader"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                    ${pathname === '/dashboard/trader'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Trader Panel</span>
                </Link>

                <Link
                  href={`/traders/${address}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                    ${pathname === `/traders/${address}`
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
              </>
            )}
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center gap-4">
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus="icon"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors
                  ${isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is no longer needed in Next.js 14
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'api.dicebear.com'],
  },
  env: {
    HYPEREVM_RPC_URL: process.env.HYPEREVM_RPC_URL || 'https://rpc.hyperliquid-testnet.xyz/evm',
    DEBRIDGE_API_KEY: process.env.DEBRIDGE_API_KEY || '',
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'wss://api.hyperliquid-testnet.xyz/ws',
  },
}

module.exports = nextConfig
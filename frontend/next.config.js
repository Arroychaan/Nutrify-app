/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bug #7 Fix: Add standalone output for proper Docker support
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.devtunnels.ms',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ]
  }
}

module.exports = nextConfig

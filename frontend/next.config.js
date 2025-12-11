/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  },
  // Allow images from any tunnel domain
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

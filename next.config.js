const path = require('path')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'dev.database.chatpatamovies.com',
      },
      {
        protocol: 'https',
        hostname: 'database.chatpatamovies.com',
      }
    ]
  }
}

module.exports = nextConfig;

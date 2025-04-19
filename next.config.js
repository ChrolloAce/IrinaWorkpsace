/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  typescript: {
    // Set to false in production for better performance, true during development
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig; 
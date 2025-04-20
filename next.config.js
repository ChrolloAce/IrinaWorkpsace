/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost'],
  },
  typescript: {
    // Ignore TypeScript errors when building
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors when building
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Only bundle server-specific modules in server build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 
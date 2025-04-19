/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['nodemailer'],
  },
  typescript: {
    // Set to false in production for better performance, true during development
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
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
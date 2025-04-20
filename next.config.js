/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['nodemailer'],
    esmExternals: 'loose',
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
    
    // Add transpilation for problematic packages
    if (!config.transpilePackages) {
      config.transpilePackages = [];
    }
    config.transpilePackages.push('@tremor/react', 'lucide-react');
    
    return config;
  },
};

module.exports = nextConfig; 
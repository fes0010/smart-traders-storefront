import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all image hosts (restrict in production)
      },
    ],
  },
};

export default nextConfig;

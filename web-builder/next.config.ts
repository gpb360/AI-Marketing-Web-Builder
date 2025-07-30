import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.ts': {
          loaders: ['ts-loader'],
          options: {
            transpileOnly: true,
          },
        },
        '*.tsx': {
          loaders: ['ts-loader'],
          options: {
            transpileOnly: true,
          },
        },
      },
    },
  },
};

export default nextConfig;

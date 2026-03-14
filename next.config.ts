import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['apify-client', 'proxy-agent'],
};

export default nextConfig;

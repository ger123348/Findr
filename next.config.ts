import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Add empty turbopack config to silence the webpack/turbopack mismatch error.
  // PDF.js worker is served statically from /public — no bundler config needed.
  turbopack: {},

  // Required for loading PDF files from external Supabase URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;

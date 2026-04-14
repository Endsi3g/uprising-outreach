import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Note: 'rewrites' do not work with 'output: export' in production builds.
  // They only work during 'next dev' for local development.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/:path*`,
      },
    ];
  },
  experimental: {
    // Silence the warning about inferred workspace root from home directory
    outputFileTracingRoot: require('path').join(__dirname, '../'),
  },
};

export default nextConfig;

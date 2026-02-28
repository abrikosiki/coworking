import type { NextConfig } from "next";

const SUPABASE_ORIGIN = process.env.SUPABASE_ORIGIN || "http://167.71.216.32:8000";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/supabase/:path*",
        destination: `${SUPABASE_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/chat",
        destination: `${backendUrl}/api/chat`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;

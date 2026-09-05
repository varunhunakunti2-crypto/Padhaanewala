import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // College galleries / cover images come from scraped external URLs on
    // arbitrary hosts (and localhost during dev). Opt into optimization for
    // those hosts rather than disabling optimizations app-wide.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
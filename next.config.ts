import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
  },
};

export default nextConfig;

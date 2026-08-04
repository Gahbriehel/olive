import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@olive/types", "@olive/ui"],
};

export default nextConfig;

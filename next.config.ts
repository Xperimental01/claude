import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/claude",
  images: { unoptimized: true },
};

export default nextConfig;

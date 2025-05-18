import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  distDir: "ot",
  images: {
    unoptimized: true
  },
  basePath: "",
  assetPrefix: "./",
  trailingSlash: true
};

export default nextConfig;

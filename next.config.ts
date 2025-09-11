import type { NextConfig } from "next";
import { isProd } from "./app/utils/env";

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix: isProd ? "https://cdn.nav.no/holmes" : undefined,
  /* config options here */
};

export default nextConfig;

import type { NextConfig } from "next";
import { isProd } from "./utils/env";

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix: isProd ? "https://cdn.nav.no/holmes" : undefined,
  experimental: {
    optimizePackageImports: ["@navikt/ds-react", "@navikt/aksel-icons"],
  },
};

export default nextConfig;

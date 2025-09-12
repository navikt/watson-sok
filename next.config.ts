import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/holmes"
      : undefined,
  experimental: {
    optimizePackageImports: ["@navikt/ds-react", "@navikt/aksel-icons"],
  },
};

export default nextConfig;

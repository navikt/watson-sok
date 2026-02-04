import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}"],
    exclude: [
      "app/**/*.spec.ts",
      "**/build/**",
      "**/test-results/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{vite,vitest,eslint,prettier}.config.*",
    ],
    globals: true,
  },
});

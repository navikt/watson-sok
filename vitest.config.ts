import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
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

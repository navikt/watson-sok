import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

vi.mock("~/logging/logging", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("env.server", () => {
  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("kaster når FARO_URL ikke er en gyldig url", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      ENVIRONMENT: "dev",
      CLUSTER: "dev-gcp",
      FARO_URL: "telemetry.nav.no/collect",
      UMAMI_SITE_ID: "site-id",
      IDENT_SESSION_SECRET: "secret",
      MODIA_URL: "https://modia.example.com",
      APP_VERSION: "test",
      UNLEASH_SERVER_API_ENV: "development",
      UNLEASH_SERVER_API_TYPE: "CLIENT",
      UNLEASH_SERVER_API_PROJECTS: "default",
      UNLEASH_SERVER_API_URL: "https://unleash.example.com",
    };

    await expect(import("./env.server")).rejects.toThrow(
      "Invalid environment variables. Check console for more information.",
    );
  });
});

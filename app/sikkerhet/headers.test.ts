import { describe, expect, it, vi } from "vitest";

vi.mock("~/config/env.server", () => ({
  FARO_CSP_SOURCE: "https://telemetry.nav.no",
  SPORING_CSP_SOURCE: "https://reops-event-proxy.nav.no",
  isProd: true,
}));

import { sikkerhetHeaders } from "./headers";

describe("sikkerhetHeaders", () => {
  it("tillater konfigurert sporing-host i connect-src", () => {
    const csp = sikkerhetHeaders()["Content-Security-Policy"];

    expect(csp).toContain(
      "connect-src 'self' https://telemetry.nav.no https://reops-event-proxy.nav.no;",
    );
  });
});

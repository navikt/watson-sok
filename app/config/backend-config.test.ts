import { describe, expect, it } from "vitest";

import { hentWatsonSakUrl } from "./backend-config";

describe("hentWatsonSakUrl", () => {
  it("bruker lokal Sak-adresse i lokale miljøer", () => {
    expect(hentWatsonSakUrl("local-backend")).toBe("http://localhost:5174");
    expect(hentWatsonSakUrl("local-dev")).toBe("http://localhost:5174");
    expect(hentWatsonSakUrl("local-mock")).toBe("http://localhost:5174");
  });

  it("bruker Sak i tilsvarende ikke-produksjonsmiljø", () => {
    expect(hentWatsonSakUrl("demo")).toBe(
      "https://watson-sak-demo.ekstern.dev.nav.no",
    );
    expect(hentWatsonSakUrl("dev")).toBe(
      "https://watson-sak.intern.dev.nav.no",
    );
  });

  it("returnerer ingen Sak-lenke i produksjon", () => {
    expect(hentWatsonSakUrl("prod")).toBeUndefined();
  });

  it("returnerer ingen URL når miljøet mangler", () => {
    expect(hentWatsonSakUrl()).toBeUndefined();
  });
});

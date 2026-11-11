import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { beregnAlderFraFødselsEllerDnummer } from "./personident-utils";

// Bare de seks første sifrene leses. Resten er nuller, så identene er ikke gyldige.
describe("beregnAlderFraFødselsEllerDnummer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 11));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("beregner alder fra fødselsnummer", () => {
    expect(beregnAlderFraFødselsEllerDnummer("15058500000", false)).toBe(41);
  });

  it("beregner alder fra D-nummer (dag + 40)", () => {
    expect(beregnAlderFraFødselsEllerDnummer("55058500000", false)).toBe(41);
  });

  it("beregner alder fra H-nummer/Dolly (måned + 40)", () => {
    expect(beregnAlderFraFødselsEllerDnummer("15458500000", false)).toBe(41);
  });

  it("beregner alder fra T-nummer/Tenor (måned + 80)", () => {
    expect(beregnAlderFraFødselsEllerDnummer("15851800000", true)).toBe(8);
  });

  it("beregner alder fra D-nummer + T-nummer", () => {
    expect(beregnAlderFraFødselsEllerDnummer("55851800000", true)).toBe(8);
  });

  it("returnerer 0 for ukjent ident", () => {
    expect(beregnAlderFraFødselsEllerDnummer("Ukjent", false)).toBe(0);
  });
});

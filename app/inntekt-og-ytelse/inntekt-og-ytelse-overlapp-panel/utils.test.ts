import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { transformTilMånedligData } from "./utils";

describe("transformTilMånedligData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("utelater sykepenger refusjon arbeidsgiver fra ytelsessummene", () => {
    const data = transformTilMånedligData(
      null,
      [
        lagYtelse("Sykepenger", 1000),
        lagYtelse("Sykepenger refusjon arbeidsgiver", 6000),
      ],
      1,
    );

    expect(data).toEqual([
      { periode: "2025-05", inntekt: 0, ytelse: 0 },
      { periode: "2025-06", inntekt: 0, ytelse: 1000 },
    ]);
  });
});

function lagYtelse(stonadType: string, bruttoBeløp: number) {
  return {
    stonadType,
    perioder: [
      {
        periode: { fom: "2025-06-01", tom: "2025-06-30" },
        beløp: bruttoBeløp,
        bruttoBeløp,
        kilde: "test",
        info: null,
      },
    ],
  };
}

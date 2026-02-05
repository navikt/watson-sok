import { describe, expect, it } from "vitest";
import {
  beregnMånederMellomDatoer,
  beregnTidsvinduDatoer,
  tidsvinduTilMåneder,
} from "./Tidsvindu";

describe("tidsvinduTilMåneder", () => {
  it("returnerer 6 for '6 måneder'", () => {
    expect(tidsvinduTilMåneder("6 måneder")).toBe(6);
  });

  it("returnerer 12 for '1 år'", () => {
    expect(tidsvinduTilMåneder("1 år")).toBe(12);
  });

  it("returnerer 36 for '3 år'", () => {
    expect(tidsvinduTilMåneder("3 år")).toBe(36);
  });

  it("returnerer 120 for '10 år'", () => {
    expect(tidsvinduTilMåneder("10 år")).toBe(120);
  });
});

describe("beregnTidsvinduDatoer", () => {
  it("returnerer tilDato lik nå-dato", () => {
    const nå = new Date("2024-06-15T12:00:00Z");

    const { tilDato } = beregnTidsvinduDatoer(6, nå);

    expect(tilDato.toISOString()).toBe(nå.toISOString());
  });

  it("beregner fraDato 6 måneder tilbake", () => {
    const nå = new Date("2024-06-15T12:00:00Z");

    const { fraDato } = beregnTidsvinduDatoer(6, nå);

    expect(fraDato.getFullYear()).toBe(2023);
    expect(fraDato.getMonth()).toBe(11); // Desember (0-indeksert)
    expect(fraDato.getDate()).toBe(15);
  });

  it("beregner fraDato 12 måneder tilbake", () => {
    const nå = new Date("2024-06-15T12:00:00Z");

    const { fraDato } = beregnTidsvinduDatoer(12, nå);

    expect(fraDato.getFullYear()).toBe(2023);
    expect(fraDato.getMonth()).toBe(5); // Juni
    expect(fraDato.getDate()).toBe(15);
  });

  it("beregner fraDato 36 måneder tilbake", () => {
    const nå = new Date("2024-06-15T12:00:00Z");

    const { fraDato } = beregnTidsvinduDatoer(36, nå);

    expect(fraDato.getFullYear()).toBe(2021);
    expect(fraDato.getMonth()).toBe(5); // Juni
  });

  it("beregner fraDato 120 måneder tilbake", () => {
    const nå = new Date("2024-06-15T12:00:00Z");

    const { fraDato } = beregnTidsvinduDatoer(120, nå);

    expect(fraDato.getFullYear()).toBe(2014);
    expect(fraDato.getMonth()).toBe(5); // Juni
  });

  it("bruker nåværende dato som default", () => {
    const før = new Date();
    const { tilDato } = beregnTidsvinduDatoer(6);
    const etter = new Date();

    expect(tilDato.getTime()).toBeGreaterThanOrEqual(før.getTime());
    expect(tilDato.getTime()).toBeLessThanOrEqual(etter.getTime());
  });

  it("håndterer månedsskifte ved årsgrense", () => {
    const nå = new Date("2024-02-15T12:00:00Z");

    const { fraDato } = beregnTidsvinduDatoer(3, nå);

    expect(fraDato.getFullYear()).toBe(2023);
    expect(fraDato.getMonth()).toBe(10); // November
  });
});

describe("beregnMånederMellomDatoer", () => {
  it("returnerer 0 for samme måned", () => {
    const fra = new Date("2024-06-01");
    const til = new Date("2024-06-30");

    expect(beregnMånederMellomDatoer(fra, til)).toBe(0);
  });

  it("beregner måneder innenfor samme år", () => {
    const fra = new Date("2024-01-15");
    const til = new Date("2024-06-15");

    expect(beregnMånederMellomDatoer(fra, til)).toBe(5);
  });

  it("beregner måneder på tvers av år", () => {
    const fra = new Date("2023-06-15");
    const til = new Date("2024-06-15");

    expect(beregnMånederMellomDatoer(fra, til)).toBe(12);
  });

  it("beregner måneder for 10 år", () => {
    const fra = new Date("2014-06-15");
    const til = new Date("2024-06-15");

    expect(beregnMånederMellomDatoer(fra, til)).toBe(120);
  });

  it("håndterer tilpasset periode", () => {
    const fra = new Date("2024-03-01");
    const til = new Date("2024-05-15");

    expect(beregnMånederMellomDatoer(fra, til)).toBe(2);
  });
});

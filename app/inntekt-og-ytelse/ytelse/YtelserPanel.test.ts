import { describe, expect, it } from "vitest";
import {
  beregnDatagrense,
  beregnHoppForTidsvindu,
  beregnMaksNavigering,
  beregnVindu,
} from "./YtelserPanel";

describe("beregnDatagrense", () => {
  const nå = new Date("2026-02-17T08:00:00Z");

  it("begrenser til 36 måneder tilbake for 3-årsvisning", () => {
    const grense = beregnDatagrense(nå, 36);
    expect(grense.getFullYear()).toBe(2023);
    expect(grense.getMonth()).toBe(nå.getMonth());
  });

  it("begrenser til 120 måneder tilbake for 10-årsvisning", () => {
    const grense = beregnDatagrense(nå, 120);
    expect(grense.getFullYear()).toBe(2016);
    expect(grense.getMonth()).toBe(nå.getMonth());
  });

  it("begrenser til 6 måneder tilbake for 6-månedersvisning", () => {
    const grense = beregnDatagrense(nå, 6);
    expect(grense.getFullYear()).toBe(2025);
    expect(grense.getMonth()).toBe(7); // august (0-indeksert)
  });

  it("begrenser til 12 måneder tilbake for 1-årsvisning", () => {
    const grense = beregnDatagrense(nå, 12);
    expect(grense.getFullYear()).toBe(2025);
    expect(grense.getMonth()).toBe(nå.getMonth());
  });
});

describe("beregnHoppForTidsvindu", () => {
  it("hopper 12 måneder for 10-årsvisning", () => {
    expect(beregnHoppForTidsvindu(120)).toBe(12);
  });

  it("hopper 6 måneder for 3-årsvisning", () => {
    expect(beregnHoppForTidsvindu(36)).toBe(6);
  });

  it("hopper 3 måneder for 1-årsvisning", () => {
    expect(beregnHoppForTidsvindu(12)).toBe(3);
  });

  it("hopper 1 måned for ukjente verdier", () => {
    expect(beregnHoppForTidsvindu(6)).toBe(1);
    expect(beregnHoppForTidsvindu(24)).toBe(1);
  });
});

describe("beregnVindu", () => {
  const nå = new Date("2026-06-15T12:00:00Z");

  it("returnerer vindu fra nå og bakover uten offset", () => {
    const vindu = beregnVindu(12, 0, nå);
    expect(vindu.slutt.getFullYear()).toBe(2026);
    expect(vindu.slutt.getMonth()).toBe(5); // juni
    expect(vindu.start.getFullYear()).toBe(2025);
    expect(vindu.start.getMonth()).toBe(5); // juni
  });

  it("forskyver vinduet bakover med offset", () => {
    const vindu = beregnVindu(12, 6, nå);
    // slutt = nå - 6 mnd = desember 2025
    expect(vindu.slutt.getFullYear()).toBe(2025);
    expect(vindu.slutt.getMonth()).toBe(11);
    // start = nå - 12 - 6 = 18 mnd tilbake = desember 2024
    expect(vindu.start.getFullYear()).toBe(2024);
    expect(vindu.start.getMonth()).toBe(11);
  });

  it("vinduets bredde matcher tidsvinduIAntallMåneder", () => {
    for (const måneder of [6, 12, 36, 120]) {
      const vindu = beregnVindu(måneder, 0, nå);
      const diffMs = vindu.slutt.getTime() - vindu.start.getTime();
      const diffMåneder = diffMs / (1000 * 60 * 60 * 24 * 30.44);
      expect(diffMåneder).toBeCloseTo(måneder, 0);
    }
  });
});

describe("beregnMaksNavigering", () => {
  it("returnerer 120 måneder (10 år) når utvidet er true", () => {
    expect(beregnMaksNavigering(true)).toBe(120);
  });

  it("returnerer 36 måneder (3 år) når utvidet er false", () => {
    expect(beregnMaksNavigering(false)).toBe(36);
  });
});

import { describe, expect, it } from "vitest";

import {
  formaterDato,
  formaterMeldekortperiodeMedUke,
  formaterTilIsoDato,
  formaterÅrMåned,
  forskjellIDager,
  ukenummer,
} from "./date-utils";

describe("formaterÅrMåned", () => {
  it("formaterer gyldig år-måned streng", () => {
    expect(formaterÅrMåned("2025-01")).toBe("januar 2025");
    expect(formaterÅrMåned("2025-12")).toBe("desember 2025");
  });

  it("returnerer bindestrek for ugyldig input", () => {
    expect(formaterÅrMåned(null)).toBe("–");
    expect(formaterÅrMåned(undefined)).toBe("–");
    expect(formaterÅrMåned("ugyldig")).toBe("–");
    expect(formaterÅrMåned("2025-1")).toBe("–");
  });
});

describe("formaterDato", () => {
  it("formaterer ISO-dato til norsk format", () => {
    expect(formaterDato("2023-01-15")).toBe("15. jan. 2023");
    expect(formaterDato("2023-12-31")).toBe("31. des. 2023");
  });
});

describe("formaterTilIsoDato", () => {
  it("formaterer Date-objekt til ISO-streng", () => {
    const dato = new Date(2025, 0, 15); // 15. januar 2025
    expect(formaterTilIsoDato(dato)).toBe("2025-01-15");
  });
});

describe("forskjellIDager", () => {
  it("beregner forskjell mellom to datoer", () => {
    expect(forskjellIDager("2025-01-01", "2025-01-02")).toBe(1);
    expect(forskjellIDager("2025-01-01", "2025-01-10")).toBe(9);
  });

  it("håndterer Date-objekter", () => {
    expect(
      forskjellIDager(new Date("2025-01-01"), new Date("2025-01-05")),
    ).toBe(4);
  });

  it("returnerer absolutt verdi uansett rekkefølge", () => {
    expect(forskjellIDager("2025-01-10", "2025-01-01")).toBe(9);
  });
});

describe("ukenummer", () => {
  it("returnerer korrekt ISO-ukenummer for en vanlig dato", () => {
    expect(ukenummer("2025-09-01")).toBe(36);
    expect(ukenummer("2025-09-14")).toBe(37);
  });

  it("håndterer årsskifte der uke 1 tilhører forrige kalenderår", () => {
    expect(ukenummer("2025-12-29")).toBe(1); // ISO-uke 1 i 2026
    expect(ukenummer("2026-01-01")).toBe(1);
  });

  it("håndterer årsskifte der siste dager i desember tilhører uke 1 neste år", () => {
    expect(ukenummer("2020-12-31")).toBe(53);
    expect(ukenummer("2021-01-01")).toBe(53); // tilhører iso-år 2020
  });

  it("håndterer Date-objekter i tillegg til ISO-strenger", () => {
    expect(ukenummer(new Date(2025, 8, 1))).toBe(36); // 1. sep 2025
  });
});

describe("formaterMeldekortperiodeMedUke", () => {
  it("viser ett ukenummer når fra- og til-dato er i samme uke", () => {
    expect(formaterMeldekortperiodeMedUke("2026-08-31", "2026-08-31")).toBe(
      "31. aug. 2026 – 31. aug. 2026 (uke 36)",
    );
  });

  it("viser ukenummer-intervall for en vanlig 14-dagers meldekortperiode", () => {
    expect(formaterMeldekortperiodeMedUke("2025-09-01", "2025-09-14")).toBe(
      "1. sep. 2025 – 14. sep. 2025 (uke 36–37)",
    );
  });
});

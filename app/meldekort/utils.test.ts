import { describe, expect, it } from "vitest";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";

import type { Dag, MeldekortRespons } from "./domene";
import { aggregerTimerPerMåned, beregnAktivitetStatistikk } from "./utils";

function lagDag(dagIndex: number, aktiviteter: Dag["aktiviteter"] = []): Dag {
  return {
    dato: `2024-01-${String(dagIndex).padStart(2, "0")}`,
    dagIndex,
    aktiviteter,
  };
}

describe("beregnAktivitetStatistikk", () => {
  it("returnerer nullverdier for tom liste", () => {
    const resultat = beregnAktivitetStatistikk([]);

    expect(resultat).toEqual({
      arbeidTimer: 0,
      ferieDager: 0,
      kursDager: 0,
      sykdomDager: 0,
    });
  });

  it("summerer arbeidstimer", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Arbeid", timer: 4 }]),
      lagDag(2, [{ id: "2", type: "Arbeid", timer: 6 }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.arbeidTimer).toBe(10);
  });

  it("teller feriedager (Fravaer)", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Fravaer" }]),
      lagDag(2, [{ id: "2", type: "Fravaer" }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.ferieDager).toBe(2);
  });

  it("teller kursdager (Utdanning)", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Utdanning" }]),
      lagDag(2, [{ id: "2", type: "Utdanning" }]),
      lagDag(3, [{ id: "3", type: "Utdanning" }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.kursDager).toBe(3);
  });

  it("teller sykdomsdager (Syk)", () => {
    const dager = [lagDag(1, [{ id: "1", type: "Syk" }])];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.sykdomDager).toBe(1);
  });

  it("håndterer null/undefined timer som 0 for arbeid", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Arbeid", timer: null }]),
      lagDag(2, [{ id: "2", type: "Arbeid", timer: undefined }]),
      lagDag(3, [{ id: "3", type: "Arbeid", timer: 5 }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.arbeidTimer).toBe(5);
  });

  it("summerer alle aktivitetstyper separat", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Arbeid", timer: 4 }]),
      lagDag(2, [{ id: "2", type: "Fravaer" }]),
      lagDag(3, [{ id: "3", type: "Utdanning" }]),
      lagDag(4, [{ id: "4", type: "Syk" }]),
      lagDag(5, [{ id: "5", type: "Arbeid", timer: 2 }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat).toEqual({
      arbeidTimer: 6,
      ferieDager: 1,
      kursDager: 1,
      sykdomDager: 1,
    });
  });

  it("håndterer flere aktiviteter per dag", () => {
    const dager = [
      lagDag(1, [
        { id: "1", type: "Arbeid", timer: 4 },
        { id: "2", type: "Utdanning" },
      ]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.arbeidTimer).toBe(4);
    expect(resultat.kursDager).toBe(1);
  });
});

// Hjelpere for aggregerTimerPerMåned-tester

function lagMeldekort(
  fraOgMed: string,
  tilOgMed: string,
  dager: Array<{ dato: string; timer: number }>,
): MeldekortRespons[number] {
  return {
    id: `mk-${fraOgMed}`,
    periode: { fraOgMed, tilOgMed },
    opprettetAv: "NAV",
    migrert: false,
    kilde: { rolle: "Bruker", ident: "12345678901" },
    dager: dager.map((d, i) => ({
      dato: d.dato,
      dagIndex: i,
      aktiviteter: [{ id: `a${i}`, type: "Arbeid" as const, timer: d.timer }],
    })),
  };
}

function lagArbeidsgiverInformasjon(
  antallTimerPrUke: number,
  fom: string,
  tom: string | null = null,
): ArbeidsgiverInformasjon {
  return {
    løpendeArbeidsforhold: [
      {
        arbeidsgiver: "Testbedriften AS",
        organisasjonsnummer: "123456789",
        ansettelsesDetaljer: [
          {
            type: "Ordinær",
            stillingsprosent: 100,
            antallTimerPrUke,
            periode: { fom, tom },
            yrke: null,
          },
        ],
      },
    ],
    historikk: [],
  };
}

describe("aggregerTimerPerMåned", () => {
  it("returnerer riktig antall måneder i perioden", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(37.5, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-03-31",
    );

    expect(resultat).toHaveLength(3);
    expect(resultat.map((r) => r.måned)).toEqual(["2025-01", "2025-02", "2025-03"]);
  });

  it("summerer MK-timer korrekt per måned", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 7.5 },
        { dato: "2025-01-07", timer: 7.5 },
      ]),
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(0, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].mkTimer).toBe(15);
  });

  it("beregner AA-timer basert på antallTimerPrUke og dager i måneden", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(37.5, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    // 31 dager / 7 ≈ 4.43 uker × 37.5 t/uke ≈ 166 timer
    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * 37.5, 1);
  });

  it("inkluderer ikke AA-timer for ansettelsesforhold utenfor perioden", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(37.5, "2025-01-01", "2025-01-15");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultat[0].aaTimer).toBe(0);
  });

  it("markerer avvik når MK-timer avviker mer enn 20 % fra AA-timer", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 10 }, // Meldekort har timer — avvik kan beregnes
      ]),
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(37.5, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].harAvvik).toBe(true);
  });

  it("markerer ikke avvik når MK-timer er 0 (ingen meldekort-data)", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 0 },
      ]),
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(37.5, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].harAvvik).toBe(false);
  });

  it("markerer ikke avvik når differansen er under terskelen", () => {
    const meldekort: MeldekortRespons = [];
    // AA-timer og MK-timer er identiske (0 begge)
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(0, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].harAvvik).toBe(false);
  });

  it("håndterer tom arbeidsgiverInformasjon uten å kaste feil", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].aaTimer).toBe(0);
    expect(resultat[0].mkTimer).toBe(0);
  });
});

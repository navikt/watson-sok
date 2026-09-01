import { describe, expect, it, vi } from "vitest";

import type { AapMeldekortRespons } from "~/aap-meldekort/domene";
import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";

import type { Dag, MeldekortRespons } from "./domene";
import {
  aggregerAapTimerPerMåned,
  aggregerTimerPerMåned,
  beregnAktivitetStatistikk,
  erTimelønnet,
  filtrerMeldekortSomOverlapperPeriode,
} from "./utils";

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

describe("filtrerMeldekortSomOverlapperPeriode", () => {
  it("inkluderer meldekort som er helt innenfor perioden", () => {
    const meldekort = [lagMeldekort("2025-01-05", "2025-01-18", [])];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(1);
  });

  it("ekskluderer meldekort som slutter dagen før perioden starter", () => {
    const meldekort = [lagMeldekort("2024-12-01", "2024-12-31", [])];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(0);
  });

  it("ekskluderer meldekort som starter dagen etter perioden slutter", () => {
    const meldekort = [lagMeldekort("2025-02-01", "2025-02-14", [])];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(0);
  });

  it("inkluderer meldekort som slutter nøyaktig på periodens startdato", () => {
    const meldekort = [lagMeldekort("2024-12-18", "2025-01-01", [])];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(1);
  });

  it("inkluderer meldekort som starter nøyaktig på periodens sluttdato", () => {
    const meldekort = [lagMeldekort("2025-01-31", "2025-02-13", [])];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(1);
  });

  it("inkluderer meldekort som strekker seg over hele perioden (starter før, slutter etter)", () => {
    const meldekort = [lagMeldekort("2024-11-01", "2025-03-01", [])];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(1);
  });

  it("filtrerer korrekt blant flere meldekort — beholder kun de som overlapper", () => {
    const meldekort = [
      lagMeldekort("2024-10-01", "2024-10-14", []), // før perioden
      lagMeldekort("2025-01-01", "2025-01-14", []), // innenfor
      lagMeldekort("2025-01-15", "2025-01-28", []), // innenfor
      lagMeldekort("2025-06-01", "2025-06-14", []), // etter perioden
    ];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(2);
  });

  it("returnerer tom liste når ingen meldekort overlapper", () => {
    const meldekort = [
      lagMeldekort("2024-01-01", "2024-01-14", []),
      lagMeldekort("2024-02-01", "2024-02-14", []),
    ];

    const resultat = filtrerMeldekortSomOverlapperPeriode(
      meldekort,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(0);
  });

  it("returnerer tom liste for tom meldekort-input", () => {
    const resultat = filtrerMeldekortSomOverlapperPeriode(
      [],
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(0);
  });
});

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

function lagArbeidsgiverInformasjonMedTimeloenn(
  timeroppføringer: Array<{
    antall: number;
    startdato: string;
    sluttdato?: string | null;
  }>,
): ArbeidsgiverInformasjon {
  return {
    løpendeArbeidsforhold: [
      {
        arbeidsgiver: "Testbedriften AS",
        organisasjonsnummer: "123456789",
        ansettelsesDetaljer: [],
        timerMedTimeloenn: timeroppføringer.map((t) => ({
          antall: t.antall,
          startdato: t.startdato,
          sluttdato: t.sluttdato ?? null,
        })),
      },
    ],
    historikk: [],
  };
}

/**
 * Bygger et arbeidsforhold der timerMedTimeloenn-oppføringer KUN har
 * rapporteringsmaaneder (ingen startdato/sluttdato) — reproduserer
 * scenarioet rapportert av Nora Helgheim Holte: Aareg rapporterer noen
 * ganger timelønnet-timer uten opptjeningsdatoer, kun rapporteringsmåned.
 */
function lagArbeidsgiverInformasjonMedRapporteringsmaaned(
  timeroppføringer: Array<{
    antall: number;
    fom: string; // "YYYY-MM"
    tom?: string | null;
  }>,
  antallTimerPrUke = 37.5,
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
            periode: { fom: "2020-01-01", tom: null },
            yrke: null,
          },
        ],
        timerMedTimeloenn: timeroppføringer.map((t) => ({
          antall: t.antall,
          startdato: null,
          sluttdato: null,
          rapporteringsmaaneder: { fom: t.fom, tom: t.tom ?? null },
        })),
      },
    ],
    historikk: [],
  };
}

describe("aggregerTimerPerMåned", () => {
  it("returnerer riktig antall måneder i perioden", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-03-31",
    );

    expect(resultat).toHaveLength(3);
    expect(resultat.map((r) => r.måned)).toEqual([
      "2025-01",
      "2025-02",
      "2025-03",
    ]);
  });

  it("håndterer perioder som krysser årsskifte", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2024-01-01",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2024-11-01",
      "2025-02-28",
    );

    expect(resultat.map((r) => r.måned)).toEqual([
      "2024-11",
      "2024-12",
      "2025-01",
      "2025-02",
    ]);
  });

  it("returnerer én måned når fra- og tildato er i samme kalendermåned", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-05",
      "2025-01-20",
    );

    expect(resultat.map((r) => r.måned)).toEqual(["2025-01"]);
  });

  it("returnerer tom liste når fradato er etter tildato", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-01-01",
    );

    expect(resultat).toHaveLength(0);
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

  it("ekskluderer ikke-Arbeid-aktiviteter (Fravaer/Utdanning/Syk) fra MK-timer-summen", () => {
    const meldekort: MeldekortRespons = [
      {
        id: "mk-blandet",
        periode: { fraOgMed: "2025-01-01", tilOgMed: "2025-01-14" },
        opprettetAv: "NAV",
        migrert: false,
        kilde: { rolle: "Bruker", ident: "12345678901" },
        dager: [
          {
            dato: "2025-01-06",
            dagIndex: 0,
            aktiviteter: [{ id: "a1", type: "Arbeid", timer: 7.5 }],
          },
          {
            dato: "2025-01-07",
            dagIndex: 1,
            aktiviteter: [{ id: "a2", type: "Fravaer", timer: null }],
          },
          {
            dato: "2025-01-08",
            dagIndex: 2,
            aktiviteter: [{ id: "a3", type: "Syk", timer: null }],
          },
          {
            dato: "2025-01-09",
            dagIndex: 3,
            aktiviteter: [{ id: "a4", type: "Utdanning", timer: null }],
          },
        ],
      },
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(0, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].mkTimer).toBe(7.5);
  });

  it("regner kun med aktiviteter i riktig måned når meldekort strekker seg over månedsskifte", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-28", "2025-02-10", [
        { dato: "2025-01-29", timer: 5 },
        { dato: "2025-01-30", timer: 5 },
        { dato: "2025-02-03", timer: 8 },
      ]),
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(0, "2025-01-01");

    const resultatJan = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );
    const resultatFeb = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultatJan[0].mkTimer).toBe(10);
    expect(resultatFeb[0].mkTimer).toBe(8);
  });

  it("beregner AA-timer basert på antallTimerPrUke og dager i måneden", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

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
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
      "2025-01-15",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultat[0].aaTimer).toBe(0);
  });

  it("pro-rerer AA-timer korrekt når ansettelsen starter midt i måneden", () => {
    const meldekort: MeldekortRespons = [];
    // Ansettelsen starter 16. januar — kun 16 av 31 dager skal telles
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-16",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo((16 / 7) * 37.5, 1);
  });

  it("pro-rerer AA-timer korrekt når ansettelsen avsluttes midt i måneden", () => {
    const meldekort: MeldekortRespons = [];
    // Ansettelsen avsluttes 10. januar — kun 10 av 31 dager skal telles
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2024-06-01",
      "2025-01-10",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo((10 / 7) * 37.5, 1);
  });

  it("summerer AA-timer fra flere samtidige arbeidsforhold", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Jobb Én AS",
          organisasjonsnummer: "111111111",
          ansettelsesDetaljer: [
            {
              type: "Ordinær",
              stillingsprosent: 50,
              antallTimerPrUke: 20,
              periode: { fom: "2025-01-01", tom: null },
              yrke: null,
            },
          ],
        },
        {
          arbeidsgiver: "Jobb To AS",
          organisasjonsnummer: "222222222",
          ansettelsesDetaljer: [
            {
              type: "Ordinær",
              stillingsprosent: 50,
              antallTimerPrUke: 15,
              periode: { fom: "2025-01-01", tom: null },
              yrke: null,
            },
          ],
        },
      ],
      historikk: [],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * (20 + 15), 1);
  });

  it("inkluderer AA-timer fra historikk-arbeidsforhold, ikke bare løpende", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [
        {
          arbeidsgiver: "Tidligere Arbeidsgiver AS",
          organisasjonsnummer: "333333333",
          ansettelsesDetaljer: [
            {
              type: "Ordinær",
              stillingsprosent: 100,
              antallTimerPrUke: 37.5,
              periode: { fom: "2024-06-01", tom: "2025-01-31" },
              yrke: null,
            },
          ],
        },
      ],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * 37.5, 1);
  });

  it("hopper over ansettelsesdetalj med antallTimerPrUke lik 0", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Testbedriften AS",
          organisasjonsnummer: "123456789",
          ansettelsesDetaljer: [
            {
              type: "Ordinær",
              stillingsprosent: 0,
              antallTimerPrUke: 0,
              periode: { fom: "2025-01-01", tom: null },
              yrke: null,
            },
          ],
        },
      ],
      historikk: [],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].aaTimer).toBe(0);
  });

  it("markerer avvik når MK-timer avviker mer enn 5 % fra AA-timer", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 10 }, // Meldekort har timer — avvik kan beregnes
      ]),
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

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
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

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

  it("markerer ikke avvik når begge er positive og differansen er godt under 5 %", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 165 },
      ]),
    ];
    // ~166t AA-timer (31 dager/7 × 37.5t), 165t MK-timer → ca. 0.6 % avvik
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(
      37.5,
      "2025-01-01",
    );

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].harAvvik).toBe(false);
  });

  it("markerer ikke avvik når AA-timer er 0 selv om MK-timer er positiv", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 20 },
      ]),
    ];
    // antallTimerPrUke=0 gir aaTimer=0
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(0, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].harAvvik).toBe(false);
  });

  it("markerer avvik når MK-timer er høyere enn AA-timer (motsatt retning)", () => {
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 100 },
        { dato: "2025-01-07", timer: 100 },
      ]),
    ];
    // MK-timer (200t) er langt høyere enn AA-timer (~20t)
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjon(5, "2025-01-01");

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat[0].harAvvik).toBe(true);
  });

  it("markerer avvik nøyaktig på 5 %-grensen (inklusiv terskel)", () => {
    // aaTimer=100, mkTimer=95 → nøyaktig 5 % avvik. Terskelen bruker >=,
    // så dette skal markeres som avvik.
    const meldekort: MeldekortRespons = [
      lagMeldekort("2025-01-01", "2025-01-14", [
        { dato: "2025-01-06", timer: 95 },
      ]),
    ];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 100, startdato: "2025-01-25", sluttdato: null },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    // Åpen periode: 100 t/uke i 7 dager (25.–31., 1 uke) = 100t AA-timer nøyaktig
    expect(resultat[0].aaTimer).toBeCloseTo(100, 5);
    expect(resultat[0].harAvvik).toBe(true);
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

describe("aggregerTimerPerMåned — timerMedTimeloenn", () => {
  it("bruker timerMedTimeloenn når tilgjengelig, i stedet for antallTimerPrUke", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 20, startdato: "2025-01-01" },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    // 31 dager / 7 × 20 t/uke
    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * 20, 1);
  });

  it("inkluderer ikke timelønnet-timer utenfor perioden", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 20, startdato: "2025-01-01", sluttdato: "2025-01-31" },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultat[0].aaTimer).toBe(0);
  });

  it("summerer kun de timerMedTimeloenn-oppføringene som overlapper måneden, blant flere", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 10, startdato: "2024-11-01", sluttdato: "2024-11-30" }, // før
      { antall: 20, startdato: "2025-01-01", sluttdato: "2025-01-31" }, // overlapper
      { antall: 30, startdato: "2025-03-01", sluttdato: "2025-03-31" }, // etter
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    // Full kalendermåned: pro-rat = 1,0 → antall (20) uendret
    expect(resultat[0].aaTimer).toBeCloseTo(20, 1);
  });

  it("viser 0 timer for timelønnet person uten data for måneden (ingen fallback)", () => {
    // Scenario: personen er timelønnet (timerMedTimeloenn er definert),
    // men har kun data for jan-25. For feb-25 skal vi vise 0 — ikke falle
    // tilbake til antallTimerPrUke (avklart med fagperson).
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Testbedriften AS",
          organisasjonsnummer: "123456789",
          timerMedTimeloenn: [
            { antall: 20, startdato: "2025-01-01", sluttdato: "2025-01-31" },
          ],
          ansettelsesDetaljer: [
            {
              type: "Ordinaer",
              stillingsprosent: null,
              antallTimerPrUke: 37.5,
              yrke: null,
              periode: { fom: "2024-01-01", tom: null },
            },
          ],
        },
      ],
      historikk: [],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultat[0].aaTimer).toBe(0);
  });

  it("håndterer løpende timelønnet-avtale (sluttdato null)", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 37.5, startdato: "2025-01-01", sluttdato: null },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-03-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * 37.5, 1);
  });

  it("pro-rater periodetotale timer — hel måned gir antall direkte", () => {
    // Aareg rapporterer antall som totale timer for perioden, ikke timer per uke.
    // En full kalendermåned skal gi antall uendret (pro-raten = 1,0).
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 132.08, startdato: "2026-03-01", sluttdato: "2026-03-31" },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-03-01",
      "2026-03-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo(132.08, 2);
  });

  it("periodetotale timer der hele perioden er innenfor måneden gir antall uendret", () => {
    // Entry dekker 22 dager av mai (7.–28.), totalperiode = 22 dager.
    // Hele perioden faller i måneden → pro-rat = 22/22 = 1,0 → 16.25 t.
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 16.25, startdato: "2026-05-07", sluttdato: "2026-05-28" },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-05-01",
      "2026-05-31",
    );

    expect(resultat[0].aaTimer).toBeCloseTo(16.25, 2);
  });

  it("pro-rater periodetotale timer som strekker seg over to måneder", () => {
    // Entry: 15. mai–14. juni = 31 dager, antall = 62 timer totalt.
    // Mai (17 dager): 62 × 17/31 ≈ 34 t
    // Juni (14 dager): 62 × 14/31 ≈ 28 t
    // Sum konserveres: 34 + 28 = 62 t
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 62, startdato: "2026-05-15", sluttdato: "2026-06-14" },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-05-01",
      "2026-06-30",
    );

    const mai = resultat.find((r) => r.måned === "2026-05")!;
    const juni = resultat.find((r) => r.måned === "2026-06")!;

    expect(mai.aaTimer).toBeCloseTo(62 * (17 / 31), 2);
    expect(juni.aaTimer).toBeCloseTo(62 * (14 / 31), 2);
    expect(mai.aaTimer + juni.aaTimer).toBeCloseTo(62, 1);
  });

  it("faller tilbake til antallTimerPrUke når timerMedTimeloenn er tom liste", () => {
    // Nav-persondata-api returnerer alltid timerMedTimeloenn: [] (aldri null)
    // for fastansatte. Tom liste betyr ikke timelønnet — bruk antallTimerPrUke.
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Nav Testbedrift AS",
          organisasjonsnummer: "123456789",
          timerMedTimeloenn: [],
          ansettelsesDetaljer: [
            {
              type: "Ordinaer",
              stillingsprosent: 100,
              antallTimerPrUke: 37.5,
              yrke: "Systemutvikler",
              periode: { fom: "2020-01", tom: null },
            },
          ],
        },
      ],
      historikk: [],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2024-04-01",
      "2024-04-30",
    );

    // 30 dager / 7 × 37.5 t/uke
    expect(resultat[0].aaTimer).toBeCloseTo((30 / 7) * 37.5, 1);
  });

  it("faller tilbake til antallTimerPrUke når alle timerMedTimeloenn-oppføringer mangler startdato", () => {
    // Reell Aareg-bug: timerMedTimeloenn er ikke-tom, men alle oppføringene
    // mangler startdato/sluttdato (ubrukelige datapunkter). Uten fiksen ble
    // forholdet feilaktig klassifisert som timelønnet og AA-timer viste 0,
    // selv om personen har en reell, fast ansettelse i samme periode.
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [
        {
          arbeidsgiver: "Bilverksted AS",
          organisasjonsnummer: "666666666",
          ansettelsesDetaljer: [
            {
              type: "Ordinaer",
              stillingsprosent: 100,
              antallTimerPrUke: 37.5,
              yrke: "MEKANIKER (BIL)",
              periode: { fom: "2023-03-01", tom: "2024-11-08" },
            },
          ],
          timerMedTimeloenn: [
            { antall: 156, startdato: null, sluttdato: null },
            { antall: 145, startdato: null, sluttdato: null },
          ],
        },
      ],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2024-04-01",
      "2024-04-30",
    );

    // 30 dager / 7 × 37.5 t/uke — IKKE 0
    expect(resultat[0].aaTimer).toBeCloseTo((30 / 7) * 37.5, 1);
  });

  it("teller ikke AA-timer flere ganger ved duplikate ansettelsesDetaljer-oppføringer", () => {
    // Reell Aareg-bug: samme ansettelsesDetalj-objekt returnert 3 ganger for
    // samme arbeidsforhold. Uten deduplisering telles antallTimerPrUke 3x.
    const identiskDetalj = {
      type: "Ordinaer",
      stillingsprosent: 100,
      antallTimerPrUke: 37.5,
      yrke: "MEKANIKER (BIL)",
      periode: { fom: "2023-03-01", tom: "2024-11-08" },
    };
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [
        {
          arbeidsgiver: "Bilverksted AS",
          organisasjonsnummer: "666666666",
          ansettelsesDetaljer: [identiskDetalj, identiskDetalj, identiskDetalj],
          timerMedTimeloenn: [],
        },
      ],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2024-04-01",
      "2024-04-30",
    );

    // Skal telles kun én gang: 30 dager / 7 × 37.5 t/uke
    expect(resultat[0].aaTimer).toBeCloseTo((30 / 7) * 37.5, 1);
  });

  it("teller ikke AA-timer flere ganger ved duplikate timerMedTimeloenn-oppføringer (regresjonstest: Aareg-bug)", () => {
    // Reell Aareg-bug: samme timerMedTimeloenn-oppføring returnert 3 ganger.
    // Uten deduplisering telles timene 3x → «alt for mange timer fra AA-registeret».
    const identiskEntry = {
      antall: 162,
      startdato: "2026-08-01",
      sluttdato: "2026-08-31",
    };
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Arbeidsgiver AS",
          organisasjonsnummer: "123456789",
          ansettelsesDetaljer: [],
          timerMedTimeloenn: [identiskEntry, identiskEntry, identiskEntry],
        },
      ],
      historikk: [],
    };

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-08-01",
      "2026-08-31",
    );

    // Skal telles kun én gang: 162 timer (ikke 486)
    expect(resultat[0].aaTimer).toBeCloseTo(162, 1);
  });

  it("bruker rapporteringsmaaneder som fallback-periode når startdato mangler (Nora Helgheim Holte sitt funn)", () => {
    // Reelt scenario: Aareg rapporterer timelønnet-timer uten
    // opptjeningsdatoer (startdato/sluttdato), kun rapporteringsperiode
    // på månedsnivå (f.eks. "februar" 2026). Før fiksen falt HELE
    // arbeidsforholdet tilbake til antallTimerPrUke (full stillingsprosent)
    // for alle måneder, og ga AA-timer mange ganger høyere enn de faktisk
    // rapporterte timelønnet-timene (207t/293t/119t vist i Watson, mot
    // 18.5t/7t/15t faktisk rapportert per måned).
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon =
      lagArbeidsgiverInformasjonMedRapporteringsmaaned([
        { antall: 18.5, fom: "2026-02" },
      ]);

    const resultatFebruar = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-02-01",
      "2026-02-28",
    );
    expect(resultatFebruar[0].aaTimer).toBeCloseTo(18.5, 1);

    // Måneder UTEN rapporteringsmaaneder-treff skal IKKE falle tilbake til
    // antallTimerPrUke — de skal gi 0, siden vi nå vet at forholdet er
    // timelønnet (ikke fastlønnet).
    const resultatMars = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-03-01",
      "2026-03-31",
    );
    expect(resultatMars[0].aaTimer).toBe(0);
  });

  it("håndterer flere rapporteringsmaaneder-oppføringer i ulike måneder uten kryssforurensning", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon =
      lagArbeidsgiverInformasjonMedRapporteringsmaaned([
        { antall: 7, fom: "2026-04" },
        { antall: 15, fom: "2026-07" },
      ]);

    const april = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-04-01",
      "2026-04-30",
    );
    const juli = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-07-01",
      "2026-07-31",
    );

    expect(april[0].aaTimer).toBeCloseTo(7, 1);
    expect(juli[0].aaTimer).toBeCloseTo(15, 1);
  });

  it("pro-raterer rapporteringsmaaneder som spenner over flere måneder", () => {
    // rapporteringsmaaneder.tom !== fom betyr at timene gjelder for HELE
    // spennet fra-til-måned — pro-rater på andel dager i hver måned,
    // samme prinsipp som periode-baserte oppføringer med startdato/sluttdato.
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon =
      lagArbeidsgiverInformasjonMedRapporteringsmaaned([
        { antall: 60, fom: "2026-01", tom: "2026-02" },
      ]);

    // Januar: 31 dager, februar: 28 dager (2026 er ikke skuddår) → 59 dager totalt
    const januar = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-01-01",
      "2026-01-31",
    );
    const februar = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-02-01",
      "2026-02-28",
    );

    expect(januar[0].aaTimer).toBeCloseTo(60 * (31 / 59), 1);
    expect(februar[0].aaTimer).toBeCloseTo(60 * (28 / 59), 1);
    expect(januar[0].aaTimer + februar[0].aaTimer).toBeCloseTo(60, 1);
  });

  it("ignorerer oppføringer som mangler BÅDE startdato og rapporteringsmaaneder", () => {
    const meldekort: MeldekortRespons = [];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Testbedriften AS",
          organisasjonsnummer: "123456789",
          ansettelsesDetaljer: [
            {
              type: "Ordinær",
              stillingsprosent: 100,
              antallTimerPrUke: 37.5,
              periode: { fom: "2020-01-01", tom: null },
              yrke: null,
            },
          ],
          timerMedTimeloenn: [
            { antall: 999, startdato: null, sluttdato: null },
          ],
        },
      ],
      historikk: [],
    };

    // Ingen oppføring har verken startdato eller rapporteringsmaaneder →
    // harTimeloennIForhold skal returnere false → fall tilbake til
    // antallTimerPrUke (fastlønnet-logikk), IKKE 999.
    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2026-02-01",
      "2026-02-28",
    );
    expect(resultat[0].aaTimer).toBeCloseTo((28 / 7) * 37.5, 1);
  });
});

describe("erTimelønnet", () => {
  it("returnerer false når ingen arbeidsforhold finnes", () => {
    const info: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };
    expect(erTimelønnet(info)).toBe(false);
  });

  it("returnerer false når timerMedTimeloenn ikke er satt (fastlønnet)", () => {
    const info = lagArbeidsgiverInformasjon(37.5, "2024-01-01");
    expect(erTimelønnet(info)).toBe(false);
  });

  it("returnerer false når timerMedTimeloenn er tom liste", () => {
    const info = lagArbeidsgiverInformasjonMedTimeloenn([]);
    expect(erTimelønnet(info)).toBe(false);
  });

  it("returnerer true når arbeidsforholdet har timerMedTimeloenn-data", () => {
    const info = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 37.5, startdato: "2024-01-01" },
    ]);
    expect(erTimelønnet(info)).toBe(true);
  });

  it("returnerer true når kun ett av flere arbeidsforhold er timelønnet", () => {
    const fastlønnet = lagArbeidsgiverInformasjon(37.5, "2024-01-01");
    const timelønnet = lagArbeidsgiverInformasjonMedTimeloenn([
      { antall: 20, startdato: "2024-01-01" },
    ]);
    const info: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        ...fastlønnet.løpendeArbeidsforhold,
        ...timelønnet.løpendeArbeidsforhold,
      ],
      historikk: [],
    };
    expect(erTimelønnet(info)).toBe(true);
  });

  it("returnerer false når alle timerMedTimeloenn-oppføringer mangler startdato", () => {
    const info: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Bilverksted AS",
          organisasjonsnummer: "666666666",
          ansettelsesDetaljer: [],
          timerMedTimeloenn: [
            { antall: 156, startdato: null, sluttdato: null },
            { antall: 145, startdato: null, sluttdato: null },
          ],
        },
      ],
      historikk: [],
    };
    expect(erTimelønnet(info)).toBe(false);
  });
});

function lagAapVedtak(
  overrides: Partial<AapMeldekortRespons[number]> & {
    perioder: AapMeldekortRespons[number]["perioder"];
  },
): AapMeldekortRespons[number] {
  return {
    vedtakId: "v1",
    status: "LØPENDE",
    saksnummer: "SAK1",
    vedtakPeriode: { fraOgMed: "2025-01-01", tilOgMed: null },
    rettighetsType: "BISTANDSBEHOV",
    kide: "KELVIN",
    tema: "AAP",
    vedtaktypeNavn: null,
    ...overrides,
  };
}

describe("aggregerAapTimerPerMåned", () => {
  it("summerer arbeidetTimer for en periode helt innenfor én måned", () => {
    const vedtak: AapMeldekortRespons = [
      lagAapVedtak({
        perioder: [
          {
            fraOgMed: "2025-03-01",
            tilOgMed: "2025-03-14",
            arbeidetTimer: 20,
            annenReduksjon: null,
            utbetalingsgrad: 80,
          },
        ],
      }),
    ];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };

    const resultat = aggregerAapTimerPerMåned(
      vedtak,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-03-31",
    );

    expect(resultat[0].mkTimer).toBeCloseTo(20, 5);
  });

  it("pro-rater arbeidetTimer for en periode som krysser månedsskifte", () => {
    // Periode 25. mars - 7. april = 14 dager, arbeidetTimer = 28 totalt.
    // Mars (7 dager): 28 × 7/14 = 14 t
    // April (7 dager): 28 × 7/14 = 14 t
    const vedtak: AapMeldekortRespons = [
      lagAapVedtak({
        perioder: [
          {
            fraOgMed: "2025-03-25",
            tilOgMed: "2025-04-07",
            arbeidetTimer: 28,
            annenReduksjon: null,
            utbetalingsgrad: 80,
          },
        ],
      }),
    ];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };

    const resultat = aggregerAapTimerPerMåned(
      vedtak,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-04-30",
    );

    const mars = resultat.find((r) => r.måned === "2025-03")!;
    const april = resultat.find((r) => r.måned === "2025-04")!;

    expect(mars.mkTimer).toBeCloseTo(14, 1);
    expect(april.mkTimer).toBeCloseTo(14, 1);
    expect(mars.mkTimer + april.mkTimer).toBeCloseTo(28, 1);
  });

  it("summerer arbeidetTimer på tvers av flere overlappende vedtak i samme måned", () => {
    // To vedtak (f.eks. rettighetsType-bytte midt i måneden) som begge har
    // en periode i mars — skal summeres, ikke overskrive hverandre.
    const vedtak: AapMeldekortRespons = [
      lagAapVedtak({
        vedtakId: "v1",
        rettighetsType: "SYKEPENGEERSTATNING",
        perioder: [
          {
            fraOgMed: "2025-03-01",
            tilOgMed: "2025-03-15",
            arbeidetTimer: 10,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ],
      }),
      lagAapVedtak({
        vedtakId: "v2",
        rettighetsType: "BISTANDSBEHOV",
        perioder: [
          {
            fraOgMed: "2025-03-16",
            tilOgMed: "2025-03-31",
            arbeidetTimer: 15,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ],
      }),
    ];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };

    const resultat = aggregerAapTimerPerMåned(
      vedtak,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-03-31",
    );

    expect(resultat[0].mkTimer).toBeCloseTo(25, 5);
  });

  it("hopper over perioder med arbeidetTimer=null uten å kaste feil", () => {
    const vedtak: AapMeldekortRespons = [
      lagAapVedtak({
        perioder: [
          {
            fraOgMed: "2025-03-01",
            tilOgMed: "2025-03-15",
            arbeidetTimer: null,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
          {
            fraOgMed: "2025-03-16",
            tilOgMed: "2025-03-31",
            arbeidetTimer: 12,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ],
      }),
    ];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };

    const resultat = aggregerAapTimerPerMåned(
      vedtak,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-03-31",
    );

    expect(resultat[0].mkTimer).toBeCloseTo(12, 5);
  });

  it("bruker felles AA-timer-beregning (samme som dagpenger) for sammenligningen", () => {
    const vedtak: AapMeldekortRespons = [
      lagAapVedtak({
        perioder: [
          {
            fraOgMed: "2025-03-01",
            tilOgMed: "2025-03-31",
            arbeidetTimer: 160,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ],
      }),
    ];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Testbedriften AS",
          organisasjonsnummer: "123456789",
          ansettelsesDetaljer: [],
          timerMedTimeloenn: [
            { antall: 37.5, startdato: "2025-01-01", sluttdato: null },
          ],
        },
      ],
      historikk: [],
    };

    const resultat = aggregerAapTimerPerMåned(
      vedtak,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-03-31",
    );

    // 31 dager / 7 × 37.5 t/uke — samme formel som for dagpenger
    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * 37.5, 1);
    expect(resultat[0].mkTimer).toBeCloseTo(160, 1);
  });

  it("tilOgMed==null er en ÅPEN periode (løper til i dag), ikke en éndags-periode", () => {
    // Kelvin sin konvensjon: tilOgMed==null betyr perioden fortsatt løper
    // uten kjent sluttdato — IKKE at perioden bare varer fraOgMed-dagen.
    // Klipp til "i dag" som foreløpig grense for pro-rateringen.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 2, 20)); // 20. mars 2025

    const vedtak: AapMeldekortRespons = [
      lagAapVedtak({
        perioder: [
          {
            // Åpen periode fra 1. mars, fortsatt pågående "i dag" (20. mars).
            // 20 dager totalt, arbeidetTimer=40 → hele beløpet gjelder mars
            // siden hele perioden (så langt) er i mars.
            fraOgMed: "2025-03-01",
            tilOgMed: null,
            arbeidetTimer: 40,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ],
      }),
    ];
    const arbeidsgiverInformasjon: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [],
    };

    const resultat = aggregerAapTimerPerMåned(
      vedtak,
      arbeidsgiverInformasjon,
      "2025-03-01",
      "2025-03-31",
    );

    expect(resultat[0].mkTimer).toBeCloseTo(40, 1);

    vi.useRealTimers();
  });
});

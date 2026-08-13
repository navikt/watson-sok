import { describe, expect, it } from "vitest";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";

import type { Dag, MeldekortRespons } from "./domene";
import {
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
      { antall: 700, startdato: "2025-01-01", sluttdato: "2025-01-01" },
    ]);

    const resultat = aggregerTimerPerMåned(
      meldekort,
      arbeidsgiverInformasjon,
      "2025-01-01",
      "2025-01-31",
    );

    // 700 t/uke i 1 dag (1/7 uke) = 100t AA-timer nøyaktig
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

    expect(resultat[0].aaTimer).toBeCloseTo((31 / 7) * 20, 1);
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
});

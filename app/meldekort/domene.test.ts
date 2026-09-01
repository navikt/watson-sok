import { describe, expect, it } from "vitest";

import { MeldekortResponsSchema, parsePTDuration } from "./domene";

// Representativt utdrag fra faktisk prod-trace (dp-datadeling Q1-2023 til 2026-08).
// Brukes til å reprodusere buggen der meldekort ble ignorert fordi:
//   1. `migrert`-feltet mangler i produksjonsdata
//   2. `timer`-feltet er ISO 8601-varighetsstreng, ikke desimaltall
const PROD_MELDEKORT_UTDRAG = [
  {
    id: "1745307403",
    ident: "99999999999",
    status: "Innsendt",
    type: "Ordinaert",
    periode: { fraOgMed: "2023-09-04", tilOgMed: "2023-09-17" },
    dager: [
      {
        dato: "2023-09-04",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c835",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 0,
      },
      { dato: "2023-09-05", aktiviteter: [], dagIndex: 1 },
      { dato: "2023-09-06", aktiviteter: [], dagIndex: 2 },
      {
        dato: "2023-09-07",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c836",
            type: "Arbeid",
            timer: "PT6H30M",
            dato: null,
          },
        ],
        dagIndex: 3,
      },
      {
        dato: "2023-09-08",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c837",
            type: "Arbeid",
            timer: "PT7H30M",
            dato: null,
          },
        ],
        dagIndex: 4,
      },
      {
        dato: "2023-09-09",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c838",
            type: "Arbeid",
            timer: "PT6H30M",
            dato: null,
          },
        ],
        dagIndex: 5,
      },
      {
        dato: "2023-09-10",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c839",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 6,
      },
      {
        dato: "2023-09-11",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c83a",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 7,
      },
      {
        dato: "2023-09-12",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c83b",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 8,
      },
      { dato: "2023-09-13", aktiviteter: [], dagIndex: 9 },
      { dato: "2023-09-14", aktiviteter: [], dagIndex: 10 },
      {
        dato: "2023-09-15",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c83c",
            type: "Arbeid",
            timer: "PT6H30M",
            dato: null,
          },
        ],
        dagIndex: 11,
      },
      {
        dato: "2023-09-16",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c83d",
            type: "Arbeid",
            timer: "PT10H30M",
            dato: null,
          },
        ],
        dagIndex: 12,
      },
      {
        dato: "2023-09-17",
        aktiviteter: [
          {
            id: "01a042e5-1448-776f-b709-84516804c83e",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 13,
      },
    ],
    kanSendes: false,
    kanEndres: true,
    kanSendesFra: "2023-09-16",
    sisteFristForTrekk: "2023-09-25",
    opprettetAv: "Arena",
    kilde: { rolle: "Bruker", ident: "99999999999" },
    innsendtTidspunkt: "2023-09-22T00:00:00",
    registrertArbeidssoker: true,
    meldedato: "2023-09-22",
    // Merk: ingen `migrert`-felt — slik prod-data faktisk ser ut
  },
  {
    id: "1745307411",
    ident: "99999999999",
    status: "Innsendt",
    type: "Ordinaert",
    periode: { fraOgMed: "2023-09-18", tilOgMed: "2023-10-01" },
    dager: [
      {
        dato: "2023-09-18",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1e9",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 0,
      },
      {
        dato: "2023-09-19",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1ea",
            type: "Arbeid",
            timer: "PT6H30M",
            dato: null,
          },
        ],
        dagIndex: 1,
      },
      { dato: "2023-09-20", aktiviteter: [], dagIndex: 2 },
      {
        dato: "2023-09-21",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1eb",
            type: "Arbeid",
            timer: "PT6H",
            dato: null,
          },
        ],
        dagIndex: 3,
      },
      {
        dato: "2023-09-22",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1ec",
            type: "Arbeid",
            timer: "PT8H",
            dato: null,
          },
        ],
        dagIndex: 4,
      },
      {
        dato: "2023-09-23",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1ed",
            type: "Arbeid",
            timer: "PT7H",
            dato: null,
          },
        ],
        dagIndex: 5,
      },
      { dato: "2023-09-24", aktiviteter: [], dagIndex: 6 },
      {
        dato: "2023-09-25",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1ee",
            type: "Arbeid",
            timer: "PT5H",
            dato: null,
          },
        ],
        dagIndex: 7,
      },
      {
        dato: "2023-09-26",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1ef",
            type: "Arbeid",
            timer: "PT5H30M",
            dato: null,
          },
        ],
        dagIndex: 8,
      },
      {
        dato: "2023-09-27",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1f0",
            type: "Arbeid",
            timer: "PT6H30M",
            dato: null,
          },
        ],
        dagIndex: 9,
      },
      {
        dato: "2023-09-28",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1f1",
            type: "Arbeid",
            timer: "PT6H",
            dato: null,
          },
        ],
        dagIndex: 10,
      },
      {
        dato: "2023-09-29",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1f2",
            type: "Arbeid",
            timer: "PT7H30M",
            dato: null,
          },
        ],
        dagIndex: 11,
      },
      {
        dato: "2023-09-30",
        aktiviteter: [
          {
            id: "01a042e5-1442-716e-ade0-86646bd8f1f3",
            type: "Arbeid",
            timer: "PT6H30M",
            dato: null,
          },
        ],
        dagIndex: 12,
      },
      { dato: "2023-10-01", aktiviteter: [], dagIndex: 13 },
    ],
    kanSendes: false,
    kanEndres: true,
    kanSendesFra: "2023-09-30",
    sisteFristForTrekk: "2023-10-09",
    opprettetAv: "Arena",
    kilde: { rolle: "Bruker", ident: "99999999999" },
    innsendtTidspunkt: "2023-10-09T00:00:00",
    registrertArbeidssoker: true,
    meldedato: "2023-10-09",
    // Merk: ingen `migrert`-felt — slik prod-data faktisk ser ut
  },
];

describe("parsePTDuration", () => {
  it("konverterer hel time", () => {
    expect(parsePTDuration("PT6H")).toBe(6);
  });

  it("konverterer timer og minutter", () => {
    expect(parsePTDuration("PT5H30M")).toBe(5.5);
  });

  it("konverterer bare minutter", () => {
    expect(parsePTDuration("PT45M")).toBeCloseTo(0.75);
  });

  it("konverterer 10 timer 30 minutter", () => {
    expect(parsePTDuration("PT10H30M")).toBe(10.5);
  });

  it("konverterer 7 timer 30 minutter", () => {
    expect(parsePTDuration("PT7H30M")).toBe(7.5);
  });

  it("returnerer 0 for ugyldig strengformat", () => {
    expect(parsePTDuration("ugyldig")).toBe(0);
  });

  it("returnerer 0 for tom varighet", () => {
    expect(parsePTDuration("PT")).toBe(0);
  });

  it("inkluderer sekunder i beregningen", () => {
    expect(parsePTDuration("PT1H30M30S")).toBeCloseTo(1.5 + 30 / 3600);
  });
});

describe("MeldekortResponsSchema — prod-data-kompatibilitet", () => {
  it("parser meldekort uten migrert-felt (regresjonstest: bug fix)", () => {
    // Bug: migrert var påkrevd i schema men finnes ikke i prod-data fra dp-datadeling
    const result = MeldekortResponsSchema.safeParse(PROD_MELDEKORT_UTDRAG);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("transformerer ISO 8601-timer til desimaltall (regresjonstest: bug fix)", () => {
    // Bug: timer ble "PT5H30M" (streng) men schema forventet z.number() → timer=null → 0 timer
    const result = MeldekortResponsSchema.safeParse(PROD_MELDEKORT_UTDRAG);

    expect(result.success).toBe(true);
    const førsteDagAktivitet = result.data?.[0].dager[0].aktiviteter[0];
    expect(førsteDagAktivitet?.timer).toBe(5.5); // "PT5H30M" → 5.5
  });

  it("transformerer PT6H korrekt til 6", () => {
    const result = MeldekortResponsSchema.safeParse(PROD_MELDEKORT_UTDRAG);

    expect(result.success).toBe(true);
    // Dag 2023-09-21 har "PT6H"
    const septemberMk2 = result.data?.[1];
    const dagMedPT6H = septemberMk2?.dager.find((d) => d.dato === "2023-09-21");
    expect(dagMedPT6H?.aktiviteter[0].timer).toBe(6);
  });

  it("transformerer PT10H30M korrekt til 10.5", () => {
    const result = MeldekortResponsSchema.safeParse(PROD_MELDEKORT_UTDRAG);

    expect(result.success).toBe(true);
    const septemberMk1 = result.data?.[0];
    const dagMedLangVakt = septemberMk1?.dager.find(
      (d) => d.dato === "2023-09-16",
    );
    expect(dagMedLangVakt?.aktiviteter[0].timer).toBe(10.5);
  });

  it("godtar null timer for ikke-Arbeid-aktiviteter", () => {
    const datamedUtdanning = [
      {
        id: "mk-utdanning",
        opprettetAv: "Arena",
        kilde: { rolle: "Bruker", ident: "99999999999" },
        periode: { fraOgMed: "2025-09-15", tilOgMed: "2025-09-28" },
        dager: [
          {
            dato: "2025-09-22",
            dagIndex: 7,
            aktiviteter: [
              {
                id: "abc",
                type: "Utdanning",
                timer: null,
                dato: null,
              },
            ],
          },
        ],
      },
    ];

    const result = MeldekortResponsSchema.safeParse(datamedUtdanning);

    expect(result.success).toBe(true);
    expect(result.data?.[0].dager[0].aktiviteter[0].timer).toBeNull();
  });

  it("ignorerer ukjente felt (kanSendes, status, type, sisteFristForTrekk osv.)", () => {
    // Prod-data har mange ekstra felt som schema ikke definerer — Zod stripper dem
    const result = MeldekortResponsSchema.safeParse(PROD_MELDEKORT_UTDRAG);

    expect(result.success).toBe(true);
    // @ts-expect-error — status finnes ikke i skjemaet
    expect(result.data?.[0].status).toBeUndefined();
  });

  it("summerer timer korrekt for september 2023 etter parsing", () => {
    // Integrasjonstest: schema-parsing → beregnMkTimerForMåned
    // Første meldekort (2023-09-04 – 2023-09-17):
    //   5.5+6.5+7.5+6.5+5.5+5.5+5.5+6.5+10.5+5.5 = 65.0
    // Andre meldekort (2023-09-18 – 2023-09-30):
    //   5.5+6.5+6+8+7+5+5.5+6.5+6+7.5+6.5 = 70.0
    // Total september = 135.0
    const result = MeldekortResponsSchema.safeParse(PROD_MELDEKORT_UTDRAG);
    expect(result.success).toBe(true);

    const septemberTimer = result.data
      ?.flatMap((mk) => mk.dager)
      .filter((dag) => dag.dato.startsWith("2023-09"))
      .flatMap((dag) => dag.aktiviteter)
      .filter((a) => a.type === "Arbeid")
      .reduce((sum, a) => sum + (a.timer ?? 0), 0);

    expect(septemberTimer).toBe(135);
  });
});

import { describe, expect, it } from "vitest";

import { lagArbeidsforholdRader } from "./ArbeidsforholdPanel";
import type { ArbeidsgiverInformasjon } from "./domene";

function lagArbeidsgiverData({
  id,
  arbeidsgiver,
  organisasjonsnummer,
  fom,
  tom,
  stillingsprosent = 100,
  type = "Ordinaer",
  yrke = "UTVIKLER",
}: {
  id: string;
  arbeidsgiver: string;
  organisasjonsnummer: string;
  fom: string;
  tom: string | null;
  stillingsprosent?: number | null;
  type?: string;
  yrke?: string | null;
}): ArbeidsgiverInformasjon["løpendeArbeidsforhold"][number] {
  return {
    id,
    arbeidsgiver,
    organisasjonsnummer,
    ansettelsesDetaljer: [
      {
        type,
        stillingsprosent,
        antallTimerPrUke: 37.5,
        periode: {
          fom,
          tom,
        },
        yrke,
      },
    ],
  };
}

describe("lagArbeidsforholdRader", () => {
  it("beholder løpende-status fra kildelisten selv når historikk mangler tom", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [
        lagArbeidsgiverData({
          id: "løpende-1",
          arbeidsgiver: "Løpende AS",
          organisasjonsnummer: "123456789",
          fom: "2024-01-01",
          tom: null,
        }),
      ],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historikk AS",
          organisasjonsnummer: "987654321",
          fom: "2024-05-01",
          tom: null,
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
    expect(arbeidsforhold[0]).toMatchObject({
      arbeidsgiver: "Løpende AS",
      løpende: true,
    });
    expect(arbeidsforhold[1]).toMatchObject({
      arbeidsgiver: "Historikk AS",
      løpende: false,
    });
  });

  it("slår ikke sammen tilstøtende perioder på tvers av kildelister", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [
        lagArbeidsgiverData({
          id: "løpende-1",
          arbeidsgiver: "Samme Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02-01",
          tom: null,
        }),
      ],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Samme Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01-01",
          tom: "2024-01-31",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
    expect(arbeidsforhold.map((rad) => rad.start)).toEqual([
      "2024-02-01",
      "2024-01-01",
    ]);
  });

  it("slår fortsatt sammen tilstøtende perioder innen samme kildeliste", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01-01",
          tom: "2024-01-31",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02-01",
          tom: "2024-03-31",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(1);
    expect(arbeidsforhold[0]).toMatchObject({
      arbeidsgiver: "Historisk Arbeidsgiver",
      start: "2024-01-01",
      slutt: "2024-03-31",
      løpende: false,
    });
  });

  it("slår ikke sammen perioder med opphold på mer enn én dag", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01-01",
          tom: "2024-01-31",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02-03",
          tom: "2024-03-31",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
  });

  it("slår ikke sammen overlappende perioder", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01-01",
          tom: "2024-02-02",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02-01",
          tom: "2024-03-31",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
  });
});

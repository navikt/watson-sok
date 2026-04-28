import { describe, expect, it } from "vitest";

import { lagArbeidsforholdRader } from "./ArbeidsforholdPanel";
import type { ArbeidsgiverInformasjon } from "./domene";

function lagArbeidsgiverData({
  id,
  arbeidsgiver,
  organisasjonsnummer,
  fom,
  tom,
  ansettelsesperiodeFom = "2020-01-01",
  ansettelsesperiodeTom = null,
  stillingsprosent = 100,
  type = "Ordinaer",
  yrke = "UTVIKLER",
}: {
  id: string;
  arbeidsgiver: string;
  organisasjonsnummer: string;
  fom: string;
  tom: string | null;
  ansettelsesperiodeFom?: string;
  ansettelsesperiodeTom?: string | null;
  stillingsprosent?: number | null;
  type?: string;
  yrke?: string | null;
}): ArbeidsgiverInformasjon["løpendeArbeidsforhold"][number] {
  return {
    id,
    arbeidsgiver,
    organisasjonsnummer,
    ansettelsesperiode: {
      fom: ansettelsesperiodeFom,
      tom: ansettelsesperiodeTom,
    },
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
          fom: "2024-01",
          tom: null,
        }),
      ],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historikk AS",
          organisasjonsnummer: "987654321",
          fom: "2024-05",
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
          fom: "2024-02",
          tom: null,
        }),
      ],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Samme Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-01",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
    expect(arbeidsforhold.map((rad) => rad.start)).toEqual([
      "2024-02",
      "2024-01",
    ]);
  });

  it("bruker detaljperioden som radens start og slutt", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [
        lagArbeidsgiverData({
          id: "løpende-1",
          arbeidsgiver: "ACME AS",
          organisasjonsnummer: "123456789",
          fom: "2024-02",
          tom: "2024-04",
          ansettelsesperiodeFom: "2020-01-01",
          ansettelsesperiodeTom: null,
        }),
      ],
      historikk: [],
    });

    expect(arbeidsforhold).toHaveLength(1);
    expect(arbeidsforhold[0]).toMatchObject({
      start: "2024-02",
      slutt: "2024-04",
    });
  });

  it("slår fortsatt sammen tilstøtende perioder innen samme kildeliste", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-01",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02",
          tom: "2024-03",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(1);
    expect(arbeidsforhold[0]).toMatchObject({
      arbeidsgiver: "Historisk Arbeidsgiver",
      start: "2024-01",
      slutt: "2024-03",
      løpende: false,
    });
  });

  it("holder perioder med ulik stillingsprosent på separate rader", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-01",
          stillingsprosent: 50,
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02",
          tom: "2024-03",
          stillingsprosent: 90,
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
    expect(arbeidsforhold[0]?.stillingsprosent).toBe(90);
    expect(arbeidsforhold[1]?.stillingsprosent).toBe(50);
  });

  it("holder perioder med ulikt yrke på separate rader", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-01",
          yrke: "UTVIKLER",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02",
          tom: "2024-03",
          yrke: "CTO",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
    expect(arbeidsforhold[0]?.yrke).toBe("CTO");
    expect(arbeidsforhold[1]?.yrke).toBe("UTVIKLER");
  });

  it("holder perioder med ulik type på separate rader", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-01",
          type: "Ordinaer",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02",
          tom: "2024-03",
          type: "Frilanser",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
    expect(arbeidsforhold[0]?.arbeidsforholdType).toBe("Frilanser");
    expect(arbeidsforhold[1]?.arbeidsforholdType).toBe("Ordinaer");
  });

  it("slår ikke sammen perioder med opphold på mer enn én måned", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-01",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-03",
          tom: "2024-03",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
  });

  it("slår ikke sammen overlappende månedlige perioder", () => {
    const arbeidsforhold = lagArbeidsforholdRader({
      løpendeArbeidsforhold: [],
      historikk: [
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-01",
          tom: "2024-02",
        }),
        lagArbeidsgiverData({
          id: "historikk-1",
          arbeidsgiver: "Historisk Arbeidsgiver",
          organisasjonsnummer: "123456789",
          fom: "2024-02",
          tom: "2024-03",
        }),
      ],
    });

    expect(arbeidsforhold).toHaveLength(2);
  });
});

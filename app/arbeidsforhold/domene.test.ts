import { describe, expect, it } from "vitest";

import { ArbeidsgiverInformasjonSchema } from "./domene";

function lagGyldigArbeidsforhold() {
  return {
    løpendeArbeidsforhold: [
      {
        id: "1",
        arbeidsgiver: "Arbeidsgiver AS",
        organisasjonsnummer: "123456789",
        ansettelsesperiode: {
          fom: "2024-01-15",
          tom: null,
        },
        ansettelsesDetaljer: [
          {
            type: "Ordinaer",
            stillingsprosent: 100,
            antallTimerPrUke: 37.5,
            periode: {
              fom: "2024-01",
              tom: null,
            },
            yrke: "UTVIKLER",
          },
        ],
      },
    ],
    historikk: [],
  };
}

describe("ArbeidsgiverInformasjonSchema", () => {
  it("godtar gyldig arbeidsforhold med ansettelsesperiode og månedsperiode i detaljer", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse(
      lagGyldigArbeidsforhold(),
    );

    expect(resultat.success).toBe(true);
  });

  it("avviser dag-nivå ISO-dato i ansettelsesDetaljer.periode.fom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesDetaljer: [
            {
              ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0]
                .ansettelsesDetaljer[0],
              periode: {
                fom: "2024-01-15",
                tom: null,
              },
            },
          ],
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser tom streng i ansettelsesDetaljer.periode.tom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesDetaljer: [
            {
              ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0]
                .ansettelsesDetaljer[0],
              periode: {
                fom: "2024-01",
                tom: "",
              },
            },
          ],
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser ugyldig måned i ansettelsesDetaljer.periode.fom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesDetaljer: [
            {
              ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0]
                .ansettelsesDetaljer[0],
              periode: {
                fom: "2024-13",
                tom: null,
              },
            },
          ],
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser ugyldig måned i ansettelsesDetaljer.periode.tom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesDetaljer: [
            {
              ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0]
                .ansettelsesDetaljer[0],
              periode: {
                fom: "2024-01",
                tom: "2024-13",
              },
            },
          ],
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser år-måned-format i ansettelsesperiode.fom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesperiode: {
            fom: "2024-01",
            tom: null,
          },
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser kalenderugyldig dato i ansettelsesperiode.fom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesperiode: {
            fom: "2024-02-31",
            tom: null,
          },
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser tom streng i ansettelsesperiode.tom", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse({
      ...lagGyldigArbeidsforhold(),
      løpendeArbeidsforhold: [
        {
          ...lagGyldigArbeidsforhold().løpendeArbeidsforhold[0],
          ansettelsesperiode: {
            fom: "2024-01-15",
            tom: "",
          },
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });
});

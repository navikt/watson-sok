import { describe, expect, it } from "vitest";

import { ArbeidsgiverInformasjonSchema } from "./domene";

function lagGyldigArbeidsforhold() {
  return {
    løpendeArbeidsforhold: [
      {
        id: "1",
        arbeidsgiver: "Arbeidsgiver AS",
        organisasjonsnummer: "123456789",
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
  it("godtar år-måned-format i arbeidsforholdsperioder", () => {
    const resultat = ArbeidsgiverInformasjonSchema.safeParse(
      lagGyldigArbeidsforhold(),
    );

    expect(resultat.success).toBe(true);
  });

  it("avviser datoformat med dag i fom", () => {
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
                fom: "2024-01-01",
                tom: null,
              },
            },
          ],
        },
      ],
    });

    expect(resultat.success).toBe(false);
  });

  it("avviser tom streng i tom", () => {
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

  it("avviser ugyldig måned i fom", () => {
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
});

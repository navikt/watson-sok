import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";

import { useAapMeldekort } from "./AapMeldekortContext";
import { AapOppsummeringPanelInnhold } from "./AapOppsummeringPanel";
import type { AapMeldekortPeriode, AapMeldekortRespons } from "./domene";

vi.mock("./AapMeldekortContext", () => ({
  useAapMeldekort: vi.fn(() => ({ status: "success", vedtak: [] })),
}));

vi.mock("~/tidsvindu/Tidsvindu", () => ({
  useTidsvindu: () => ({
    tidsvindu: "3 måneder",
    fraDato: new Date("2024-04-01"),
    tilDato: new Date("2024-06-30"),
  }),
}));

function lagVedtakMedPerioder(
  perioder: AapMeldekortPeriode[],
): AapMeldekortRespons[number] {
  return {
    vedtakId: "v1",
    status: "LØPENDE",
    saksnummer: "SAK1",
    vedtakPeriode: { fraOgMed: "2024-01-01", tilOgMed: null },
    rettighetsType: "BISTANDSBEHOV",
    kide: "KELVIN",
    tema: "AAP",
    vedtaktypeNavn: null,
    perioder,
  };
}

function lagTimelønnetArbeidsgiverInformasjon(): ArbeidsgiverInformasjon {
  return {
    løpendeArbeidsforhold: [
      {
        arbeidsgiver: "Testbedriften AS",
        organisasjonsnummer: "123456789",
        ansettelsesDetaljer: [],
        timerMedTimeloenn: [
          { antall: 37.5, startdato: "2024-01-01", sluttdato: null },
        ],
      },
    ],
    historikk: [],
  };
}

describe("AapOppsummeringPanelInnhold", () => {
  it("viser ikke 'Ingen timer'-melding og rendrer grafen for timelønnet bruker", () => {
    render(
      <AapOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.queryByText(/Ingen timer fra AA-registeret/)).toBeNull();
    expect(screen.getByRole("region", { name: /Stolpediagram/ })).toBeDefined();
  });

  it("viser 'Ingen data'-melding når arbeidsgiverInformasjon er null", () => {
    render(
      <AapOppsummeringPanelInnhold
        arbeidsgiverInformasjon={null}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.getByText(/Ingen data tilgjengelig/)).toBeDefined();
  });

  it("viser avvik-banner med korrekt antall når noen måneder har avvik", () => {
    vi.mocked(useAapMeldekort).mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtakMedPerioder([
          {
            fraOgMed: "2024-05-01",
            tilOgMed: "2024-05-14",
            arbeidetTimer: 5,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
          {
            fraOgMed: "2024-06-01",
            tilOgMed: "2024-06-14",
            arbeidetTimer: 10,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ]),
      ],
    });

    render(
      <AapOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(
      screen.getByText(/perioder med avvik mellom AAP-meldekort/),
    ).toBeDefined();
  });

  it("viser ikke avvik-banner når ingen måneder har avvik", () => {
    vi.mocked(useAapMeldekort).mockReturnValue({
      status: "success",
      vedtak: [],
    });

    render(
      <AapOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(
      screen.queryByText(/perioder med avvik|periode med avvik/),
    ).toBeNull();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";

import { MeldekortOppsummeringPanelInnhold } from "./MeldekortOppsummeringPanel";

vi.mock("~/meldekort/MeldekortContext", () => ({
  useMeldekort: () => ({ status: "success", meldekort: [] }),
}));

vi.mock("~/tidsvindu/Tidsvindu", () => ({
  useTidsvindu: () => ({
    tidsvindu: "3 måneder",
    fraDato: new Date("2024-04-01"),
    tilDato: new Date("2024-06-30"),
  }),
}));

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

function lagFastlønnetArbeidsgiverInformasjon(): ArbeidsgiverInformasjon {
  return {
    løpendeArbeidsforhold: [
      {
        arbeidsgiver: "Testbedriften AS",
        organisasjonsnummer: "123456789",
        ansettelsesDetaljer: [
          {
            type: "Ordinær",
            stillingsprosent: 100,
            antallTimerPrUke: 37.5,
            periode: { fom: "2024-01-01", tom: null },
            yrke: null,
          },
        ],
      },
    ],
    historikk: [],
  };
}

describe("MeldekortOppsummeringPanelInnhold", () => {
  it("viser ikke 'Ingen timer'-melding og rendrer grafen for timelønnet bruker", () => {
    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.queryByText(/Ingen timer fra AA-registeret/)).toBeNull();
    expect(screen.getByRole("region", { name: /Stolpediagram/ })).toBeDefined();
  });

  it("viser 'Ingen timer'-melding for fastlønnet bruker (ingen timerMedTimeloenn)", () => {
    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagFastlønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.getByText(/Ingen timer fra AA-registeret/)).toBeDefined();
  });

  it("viser 'Ingen timer'-melding når timerMedTimeloenn er tom liste", () => {
    const info: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [
        {
          arbeidsgiver: "Testbedriften AS",
          organisasjonsnummer: "123456789",
          ansettelsesDetaljer: [],
          timerMedTimeloenn: [],
        },
      ],
      historikk: [],
    };

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={info}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.getByText(/Ingen timer fra AA-registeret/)).toBeDefined();
  });

  it("viser 'Ingen data'-melding når arbeidsgiverInformasjon er null", () => {
    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={null}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.getByText(/Ingen data tilgjengelig/)).toBeDefined();
  });
});

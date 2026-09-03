import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";
import { useMeldekort } from "~/meldekort/MeldekortContext";

import type { MeldekortRespons } from "./domene";
import { MeldekortOppsummeringPanelInnhold } from "./MeldekortOppsummeringPanel";

vi.mock("~/meldekort/MeldekortContext", () => ({
  useMeldekort: vi.fn(() => ({ status: "success", meldekort: [] })),
}));

vi.mock("~/tidsvindu/Tidsvindu", () => ({
  useTidsvindu: () => ({
    tidsvindu: "3 måneder",
    fraDato: new Date("2024-04-01"),
    tilDato: new Date("2024-06-30"),
  }),
}));

function lagMeldekortMedArbeid(
  fraOgMed: string,
  tilOgMed: string,
  arbeidstimerPåFørsteDag: number,
): MeldekortRespons[number] {
  return {
    id: `${fraOgMed}-${tilOgMed}`,
    periode: { fraOgMed, tilOgMed },
    opprettetAv: "Dagpenger",
    migrert: false,
    kilde: { rolle: "Bruker", ident: "12345678901" },
    dager: [
      {
        dato: fraOgMed,
        dagIndex: 0,
        aktiviteter: [
          { id: "a1", type: "Arbeid", timer: arbeidstimerPåFørsteDag },
        ],
      },
    ],
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

function lagTimelønnetArbeidsgiverInformasjonUtenPeriode(): ArbeidsgiverInformasjon {
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
        timerMedTimeloenn: [{ antall: 37.5, startdato: null, sluttdato: null }],
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

  it("viser ikke grafen eller avvik når AA-timene mangler periodeinformasjon", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [lagMeldekortMedArbeid("2024-05-01", "2024-05-14", 5)],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjonUtenPeriode()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(
      screen.getByText(/AA-timer kan ikke sammenlignes for valgt periode/),
    ).toBeDefined();
    expect(screen.queryByRole("region", { name: /Stolpediagram/ })).toBeNull();
    expect(
      screen.queryByText(/perioder med avvik|periode med avvik/),
    ).toBeNull();
  });

  it("viser grafen når timerMedTimeloenn kun finnes i historikk (avsluttet arbeidsforhold)", () => {
    const info: ArbeidsgiverInformasjon = {
      løpendeArbeidsforhold: [],
      historikk: [
        {
          arbeidsgiver: "Tidligere Arbeidsgiver AS",
          organisasjonsnummer: "987654321",
          ansettelsesDetaljer: [],
          timerMedTimeloenn: [
            { antall: 37.5, startdato: "2024-04-01", sluttdato: "2024-06-30" },
          ],
        },
      ],
    };

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={info}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.queryByText(/Ingen timer fra AA-registeret/)).toBeNull();
    expect(screen.getByRole("region", { name: /Stolpediagram/ })).toBeDefined();
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

  it("viser avvik-banner med korrekt antall når noen måneder har avvik", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [
        // April: ingen meldekort-timer registrert i det hele tatt -> ikke avvik (mkTimer=0)
        // Mai: kraftig avvik (kun 5t rapportert mot ~166t AA-timer)
        lagMeldekortMedArbeid("2024-05-01", "2024-05-14", 5),
        // Juni: kraftig avvik (kun 10t rapportert mot ~160t AA-timer)
        lagMeldekortMedArbeid("2024-06-01", "2024-06-14", 10),
      ],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(
      screen.getByText(/2 perioder med avvik mellom meldekort/),
    ).toBeDefined();
  });

  it("viser entallsform i avvik-banner når kun én måned har avvik", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [lagMeldekortMedArbeid("2024-06-01", "2024-06-14", 10)],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-06-01"
        tilDato="2024-06-30"
      />,
    );

    expect(
      screen.getByText(
        "1 periode med avvik mellom meldekort og AA-registreringen",
      ),
    ).toBeDefined();
  });

  it("viser ikke avvik-banner når ingen måneder har avvik", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(
      screen.queryByText(/perioder med avvik|periode med avvik/),
    ).toBeNull();
  });

  it("viser ikke lenger blå informasjonspille med antall meldekort (fjernet, matcher Figma)", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [lagMeldekortMedArbeid("2024-05-01", "2024-05-14", 5)],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.queryByText(/meldekort levert/)).toBeNull();
  });

  it("begrenser grafen til de siste 12 månedene for en lengre periode", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        // 20 måneder (2024-01 til 2025-08) — skal trimmes til siste 12
        fraDato="2024-01-01"
        tilDato="2025-08-31"
      />,
    );

    // 12 måneder * 2 søyler (AA + MK) = 24 <rect>-elementer med søyle-fyll,
    // enklest å verifisere via aria-label-count på hver måneds <g>-gruppe.
    const grafRegion = screen.getByRole("region", { name: /Stolpediagram/ });
    const månedGrupper = grafRegion.querySelectorAll('g[role="img"]');
    expect(månedGrupper).toHaveLength(12);
  });

  it("viser alle måneder uten trimming når perioden er kortere enn 12 måneder", () => {
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    const grafRegion = screen.getByRole("region", { name: /Stolpediagram/ });
    const månedGrupper = grafRegion.querySelectorAll('g[role="img"]');
    expect(månedGrupper).toHaveLength(3);
  });

  it("viser ikke avvik-banner for fastlønnet bruker, selv om intern antallTimerPrUke-beregning ville gitt avvik", () => {
    // Regresjonstest: for en ikke-timelønnet (fastlønnet) bruker viser
    // panelet 'Ingen timer fra AA-registeret å vise' — det ville vært
    // selvmotsigende å SAMTIDIG vise et avvik-varsel basert på en AA-timer-
    // verdi (antallTimerPrUke-fallback) vi eksplisitt har valgt å ikke vise.
    vi.mocked(useMeldekort).mockReturnValue({
      status: "success",
      meldekort: [
        lagMeldekortMedArbeid("2024-05-01", "2024-05-14", 2), // Langt unna antallTimerPrUke-baserte ~75t/mnd
      ],
    });

    render(
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagFastlønnetArbeidsgiverInformasjon()}
        fraDato="2024-04-01"
        tilDato="2024-06-30"
      />,
    );

    expect(screen.getByText(/Ingen timer fra AA-registeret/)).toBeDefined();
    expect(
      screen.queryByText(/perioder med avvik|periode med avvik/),
    ).toBeNull();
  });
});

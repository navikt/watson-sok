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

/**
 * Arbeidsforhold UTEN timerMedTimeloenn — kun fastlønnet/full stilling
 * (antallTimerPrUke). erTimelønnet() skal returnere false for denne, men
 * beregnAaTimerForMåned faller likevel tilbake til antallTimerPrUke internt
 * for AA-timer-beregningen (samme design som for fastlønnede DP-brukere) —
 * se regresjonstesten under for hvorfor dette IKKE skal utløse avvik-banner.
 */
function lagIkkeTimelønnetArbeidsgiverInformasjon(): ArbeidsgiverInformasjon {
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
            periode: { fom: "2020-01-01", tom: null },
            yrke: null,
          },
        ],
        timerMedTimeloenn: [],
      },
    ],
    historikk: [],
  };
}

describe("AapOppsummeringPanelInnhold", () => {
  it("viser ikke 'Ingen timer'-melding og rendrer grafen når det finnes AAP-vedtak for timelønnet bruker", () => {
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

    expect(screen.queryByText(/Ingen timer fra AA-registeret/)).toBeNull();
    expect(screen.getByRole("region", { name: /Stolpediagram/ })).toBeDefined();
  });

  it("viser 'Ingen data'-melding (ikke grafen) når det ikke finnes AAP-vedtak i det hele tatt", () => {
    // Regresjonstest: uten vedtak blir meldekort-timer alltid 0, som ville
    // fått grafen til å se ut som 100% avvik hver måned — feilaktig,
    // siden det bare er fravær av data, ikke et reelt avvik.
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

    expect(screen.queryByRole("region", { name: /Stolpediagram/ })).toBeNull();
    expect(screen.getByText(/Ingen data tilgjengelig/)).toBeDefined();
  });

  it("viser 'Ingen data'-melding (ikke grafen) når vedtaket finnes men ligger utenfor den viste perioden", () => {
    // Regresjonstest: en person kan ha ET vedtak (f.eks. et løpende AAP-vedtak
    // fra sep 2025), men bli vist i en eldre, historisk ytelsesperiode (f.eks.
    // jul-sep 2024) som ligger helt før vedtaket startet. Det er ikke nok å
    // sjekke om personen har NOE vedtak i det hele tatt — vi må sjekke om
    // vedtaket faktisk overlapper akkurat DENNE periodens datoer.
    vi.mocked(useAapMeldekort).mockReturnValue({
      status: "success",
      vedtak: [
        {
          vedtakId: "v1",
          status: "LØPENDE",
          saksnummer: "SAK1",
          vedtakPeriode: { fraOgMed: "2025-09-01", tilOgMed: null },
          rettighetsType: "BISTANDSBEHOV",
          kide: "KELVIN",
          tema: "AAP",
          vedtaktypeNavn: null,
          perioder: [
            {
              fraOgMed: "2025-09-01",
              tilOgMed: "2025-09-14",
              arbeidetTimer: 10,
              annenReduksjon: null,
              utbetalingsgrad: 100,
            },
          ],
        },
      ],
    });

    render(
      <AapOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagTimelønnetArbeidsgiverInformasjon()}
        fraDato="2024-07-01"
        tilDato="2024-09-30"
      />,
    );

    expect(screen.queryByRole("region", { name: /Stolpediagram/ })).toBeNull();
    expect(screen.getByText(/Ingen data tilgjengelig/)).toBeDefined();
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

  it("viser ikke avvik-banner for ikke-timelønnet bruker, selv om intern antallTimerPrUke-beregning ville gitt avvik", () => {
    // Regresjonstest: for en ikke-timelønnet bruker viser panelet
    // 'Ingen timer fra AA-registeret å vise' — det ville vært selvmotsigende
    // å SAMTIDIG vise et avvik-varsel basert på en AA-timer-verdi
    // (antallTimerPrUke-fallback) vi eksplisitt har valgt å ikke vise fram.
    vi.mocked(useAapMeldekort).mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtakMedPerioder([
          {
            fraOgMed: "2024-05-01",
            tilOgMed: "2024-05-14",
            arbeidetTimer: 2, // Langt unna antallTimerPrUke-baserte ~75t/mnd — ville gitt stort avvik
            annenReduksjon: null,
            utbetalingsgrad: 100,
          },
        ]),
      ],
    });

    render(
      <AapOppsummeringPanelInnhold
        arbeidsgiverInformasjon={lagIkkeTimelønnetArbeidsgiverInformasjon()}
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

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAapMeldekort } from "./AapMeldekortContext";
import { AapMeldekortPanel } from "./AapMeldekortPanel";
import type { AapMeldekortPeriode, AapMeldekortRespons } from "./domene";

vi.mock("./AapMeldekortContext", () => ({
  useAapMeldekort: vi.fn(),
}));

function lagVedtak(
  vedtakId: string,
  perioder: AapMeldekortPeriode[],
): AapMeldekortRespons[number] {
  return {
    vedtakId,
    status: "LØPENDE",
    saksnummer: `SAK-${vedtakId}`,
    vedtakPeriode: { fraOgMed: "2025-01-01", tilOgMed: null },
    rettighetsType: "BISTANDSBEHOV",
    kide: "KELVIN",
    tema: "AAP",
    vedtaktypeNavn: null,
    perioder,
  };
}

function lagPeriode(
  fraOgMed: string,
  tilOgMed: string | null,
  overrides: Partial<AapMeldekortPeriode> = {},
): AapMeldekortPeriode {
  return {
    fraOgMed,
    tilOgMed,
    arbeidetTimer: null,
    annenReduksjon: null,
    utbetalingsgrad: 100,
    ...overrides,
  };
}

const mockUseAapMeldekort = vi.mocked(useAapMeldekort);

describe("AapMeldekortPanel", () => {
  it("viser feilmelding når henting feiler", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "error",
      error: "Noe gikk galt",
    });

    render(<AapMeldekortPanel fraDato="2025-01-01" tilDato="2025-01-31" />);

    expect(
      screen.getByText(/Kunne ikke hente AAP-meldekort: Noe gikk galt/),
    ).toBeDefined();
  });

  it("viser 'ingen meldekort'-melding når det ikke finnes vedtak", () => {
    mockUseAapMeldekort.mockReturnValue({ status: "success", vedtak: [] });

    render(<AapMeldekortPanel fraDato="2025-01-01" tilDato="2025-01-31" />);

    expect(screen.getByText("Ingen AAP-meldekort registrert.")).toBeDefined();
  });

  it("viser 'ingen meldekort i perioden' når perioder finnes utenfor valgt tidsvindu", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [lagVedtak("v1", [lagPeriode("2020-01-01", "2020-01-14")])],
    });

    render(<AapMeldekortPanel fraDato="2025-01-01" tilDato="2025-01-31" />);

    expect(
      screen.getByText("Ingen AAP-meldekort i denne perioden."),
    ).toBeDefined();
  });

  it("summerer arbeidetTimer og regner snitt utbetalingsgrad på tvers av vedtak", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", [
          lagPeriode("2025-01-01", "2025-01-14", {
            arbeidetTimer: 10,
            utbetalingsgrad: 80,
          }),
        ]),
        lagVedtak("v2", [
          lagPeriode("2025-01-15", "2025-01-28", {
            arbeidetTimer: 20,
            utbetalingsgrad: 100,
          }),
        ]),
      ],
    });

    render(<AapMeldekortPanel fraDato="2025-01-01" tilDato="2025-01-31" />);

    expect(screen.getByText("30 t")).toBeDefined();
    expect(screen.getByText("90 %")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("behandler arbeidetTimer=null som 0 i summen, men viser '–' for snitt utbetalingsgrad når alle er null", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", [
          lagPeriode("2025-01-01", "2025-01-14", {
            arbeidetTimer: null,
            utbetalingsgrad: null,
          }),
        ]),
      ],
    });

    render(<AapMeldekortPanel fraDato="2025-01-01" tilDato="2025-01-31" />);

    expect(screen.getByText("0 t")).toBeDefined();
    expect(screen.getByText("–")).toBeDefined();
  });
});

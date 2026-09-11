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
    arbeidPerDag: [],
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

  it("prorerer arbeidetTimer når en periode bare delvis overlapper valgt vindu", () => {
    // Regresjonstest for Copilot-kommentar: en periode som strekker seg
    // UTENFOR valgt vindu skal ikke bidra med sin fulle arbeidetTimer til
    // "Totalt fra {fraDato} til {tilDato}" - kun den prorerte andelen som
    // faktisk faller innenfor vinduet.
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", [
          // 14-dagers periode (1.-14. jan), men vinduet vi spør om er kun
          // 10.-14. jan (5 av 14 dager, altså 5/14 av periodens 14t).
          lagPeriode("2025-01-01", "2025-01-14", {
            arbeidetTimer: 14,
            utbetalingsgrad: 100,
          }),
        ]),
      ],
    });

    render(<AapMeldekortPanel fraDato="2025-01-10" tilDato="2025-01-14" />);

    // 14t * (5/14 overlappende dager) = 5t
    expect(screen.getByText("5 t")).toBeDefined();
  });

  it("viser '–' for arbeidetTimer totalt (ikke '0 t') når ingen perioder har data", () => {
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

    expect(screen.queryByText("0 t")).toBeNull();
    expect(screen.getAllByText("–").length).toBeGreaterThanOrEqual(2);
  });
});

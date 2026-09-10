import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAapMeldekort } from "./AapMeldekortContext";
import type { AapMeldekortPeriode, AapMeldekortRespons } from "./domene";
import { IndividuelleAapMeldekortAccordion } from "./IndividuelleAapMeldekortAccordion";

vi.mock("./AapMeldekortContext", () => ({
  useAapMeldekort: vi.fn(),
}));

function lagVedtak(
  vedtakId: string,
  saksnummer: string,
  perioder: AapMeldekortPeriode[],
): AapMeldekortRespons[number] {
  return {
    vedtakId,
    status: "LØPENDE",
    saksnummer,
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

describe("IndividuelleAapMeldekortAccordion", () => {
  it("returnerer null når aap-data laster", () => {
    mockUseAapMeldekort.mockReturnValue({ status: "loading" });

    const { container } = render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-02-28"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("returnerer null når det ikke finnes vedtak", () => {
    mockUseAapMeldekort.mockReturnValue({ status: "success", vedtak: [] });

    const { container } = render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-02-28"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("returnerer null når ingen perioder overlapper valgt tidsvindu", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [lagPeriode("2020-01-01", "2020-01-14")]),
      ],
    });

    const { container } = render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-02-28"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("viser antall perioder i accordion-headeren", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2025-01-01", "2025-01-14", { arbeidetTimer: 12 }),
          lagPeriode("2025-01-15", "2025-01-28", { arbeidetTimer: 8 }),
        ]),
      ],
    });

    render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-01-31"
      />,
    );

    expect(
      screen.getByText("Vis individuelle AAP-meldekort (2)"),
    ).toBeDefined();
  });

  it("viser nyeste periode først med arbeidetTimer, annenReduksjon og utbetalingsgrad", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2025-01-01", "2025-01-14", {
            arbeidetTimer: 5,
            annenReduksjon: 20,
            utbetalingsgrad: 80,
          }),
          lagPeriode("2025-01-15", "2025-01-28", {
            arbeidetTimer: 10,
            annenReduksjon: null,
            utbetalingsgrad: 100,
          }),
        ]),
      ],
    });

    render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-01-31"
      />,
    );

    fireEvent.click(screen.getByText("Vis individuelle AAP-meldekort (2)"));

    expect(screen.getByText("10 t")).toBeDefined();
    expect(screen.getByText("100 %")).toBeDefined();
    expect(screen.getByText("–")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Forrige periode" }));

    expect(screen.getByText("5 t")).toBeDefined();
    expect(screen.getByText("20 %")).toBeDefined();
    expect(screen.getByText("80 %")).toBeDefined();
  });

  it("viser perioder uten sluttdato som 'pågår'", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [lagVedtak("v1", "SAK1", [lagPeriode("2025-01-01", null)])],
    });

    render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-01-31"
      />,
    );

    fireEvent.click(screen.getByText("Vis individuelle AAP-meldekort (1)"));

    expect(screen.getByText(/pågår/)).toBeDefined();
  });

  it("viser '–' for arbeidetTimer når verdien er null (ikke '0 t')", () => {
    // Regresjonstest: arbeidetTimer er number|null i domenet, og null
    // betyr fravær av data, ikke 0 timer arbeidet. Samme prinsipp som
    // annenReduksjon/utbetalingsgrad under.
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2025-01-01", "2025-01-14", { arbeidetTimer: null }),
        ]),
      ],
    });

    render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-01-31"
      />,
    );

    fireEvent.click(screen.getByText("Vis individuelle AAP-meldekort (1)"));

    expect(screen.queryByText("0 t")).toBeNull();
    expect(screen.getByText("Arbeidet timer").closest("div")).toBeDefined();
    expect(screen.getAllByText("–").length).toBeGreaterThan(0);
  });
});

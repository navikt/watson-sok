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
    arbeidPerDag: [],
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

  it("viser 'Dette meldekortet'-overskrift og vedtak/saksnummer-info (mal fra dagpenger)", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2025-01-01", "2025-01-14", { arbeidetTimer: 12 }),
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

    expect(screen.getByText("Dette meldekortet")).toBeDefined();
    expect(screen.getByText(/Vedtak: v1/)).toBeDefined();
    expect(screen.getByText(/Saksnummer: SAK1/)).toBeDefined();
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

  it("viser dag-for-dag-grid med timer arbeidet per dag når arbeidPerDag finnes", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2025-01-06", "2025-01-10", {
            arbeidPerDag: [
              { dag: "2025-01-06", timerArbeidet: 7.5 },
              { dag: "2025-01-07", timerArbeidet: 7.5 },
            ],
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

    fireEvent.click(screen.getByText("Vis individuelle AAP-meldekort (1)"));

    expect(screen.getByText("Arbeidet per dag")).toBeDefined();
    // To dager med data (7,5t hver) og tre dager i perioden uten data ("–")
    expect(screen.getAllByText("7,5 t")).toHaveLength(2);
    expect(screen.getAllByText("–").length).toBeGreaterThanOrEqual(3);
  });

  it("viser ikke dag-for-dag-seksjonen når arbeidPerDag er tom", () => {
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2025-01-01", "2025-01-14", { arbeidPerDag: [] }),
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

    expect(screen.queryByText("Arbeidet per dag")).toBeNull();
  });

  it("viser ikke dag-for-dag-seksjonen for uvanlig lange aggregatperioder (regresjonstest)", () => {
    // Regresjonstest for Copilot-kommentar: fixture 22107622199.json har en
    // periode fra 2016-06-01 til 2016-11-30 (~183 dager). Uten en øvre
    // grense ville dette rendret én DOM-node per kalenderdag.
    mockUseAapMeldekort.mockReturnValue({
      status: "success",
      vedtak: [
        lagVedtak("v1", "SAK1", [
          lagPeriode("2016-06-01", "2016-11-30", {
            arbeidPerDag: [{ dag: "2016-06-01", timerArbeidet: 5 }],
          }),
        ]),
      ],
    });

    render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2016-01-01"
        tilDato="2016-12-31"
      />,
    );

    fireEvent.click(screen.getByText("Vis individuelle AAP-meldekort (1)"));

    expect(screen.queryByText("Arbeidet per dag")).toBeNull();
  });

  it("nullstiller aktivIndex når fraDato/tilDato endres, selv med samme antall perioder", () => {
    const vedtakA = [
      lagVedtak("v1", "SAK1", [
        lagPeriode("2025-01-01", "2025-01-14", { arbeidetTimer: 1 }),
        lagPeriode("2025-01-15", "2025-01-28", { arbeidetTimer: 2 }),
      ]),
    ];
    mockUseAapMeldekort.mockReturnValue({ status: "success", vedtak: vedtakA });

    const { rerender } = render(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-01-01"
        tilDato="2025-01-31"
      />,
    );

    fireEvent.click(screen.getByText("Vis individuelle AAP-meldekort (2)"));
    // Naviger til eldste periode (indeks 1)
    fireEvent.click(screen.getByRole("button", { name: "Forrige periode" }));
    expect(screen.getByText(/1. jan\. 2025/)).toBeDefined();

    // Bytt til et annet utvalg med samme ANTALL perioder (2), men andre data
    const vedtakB = [
      lagVedtak("v2", "SAK2", [
        lagPeriode("2025-02-01", "2025-02-14", { arbeidetTimer: 3 }),
        lagPeriode("2025-02-15", "2025-02-28", { arbeidetTimer: 4 }),
      ]),
    ];
    mockUseAapMeldekort.mockReturnValue({ status: "success", vedtak: vedtakB });
    rerender(
      <IndividuelleAapMeldekortAccordion
        fraDato="2025-02-01"
        tilDato="2025-02-28"
      />,
    );

    // Skal vise NYESTE periode (15.-28. feb), ikke stå igjen på indeks 1
    expect(screen.getByText(/15\. feb\. 2025/)).toBeDefined();
  });
});

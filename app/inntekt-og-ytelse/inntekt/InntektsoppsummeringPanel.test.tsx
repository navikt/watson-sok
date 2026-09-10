import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PensjonsgivendeInntekt } from "~/inntekt-og-ytelse/pensjonsgivende-inntekt/domene";

import type { InntektInformasjon } from "./domene";
import { InntektsoppsummeringPanelInnhold } from "./InntektsoppsummeringPanel";

vi.mock("~/tidsvindu/Tidsvindu", () => ({
  useTidsvindu: () => ({
    tidsvindu: "3 år",
    tidsvinduIAntallMåneder: 36,
    fraDato: new Date("2023-01-01"),
    tilDato: new Date("2025-12-31"),
  }),
}));

function lagInntektInformasjon(
  overrides: Partial<InntektInformasjon> = {},
): InntektInformasjon {
  return {
    lønnsinntekt: [],
    næringsinntekt: [],
    pensjonEllerTrygd: [],
    ytelseFraOffentlige: [],
    ...overrides,
  };
}

const iDag = new Date();
const nyligPeriode = `${iDag.getFullYear()}-${String(iDag.getMonth() + 1).padStart(2, "0")}`;

describe("InntektsoppsummeringPanel — næringsinntekt (SEARCH-31 Figma-integrasjon)", () => {
  it("viser næringsinntekt som subseksjon inni Inntektsoppsummering, ikke separat panel", () => {
    const næringsinntekt: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 128000, lønnsinntekt: 0 },
      { inntektsår: "2023", næringsinntekt: 53000, lønnsinntekt: 0 },
    ];
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={lagInntektInformasjon()}
        pensjonsgivendeInntekt={næringsinntekt}
        harNæringsinntektKilde={true}
      />,
    );

    expect(screen.getByText(/Inntekts.?oppsummering/)).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "Næringsinntekt" }),
    ).toBeDefined();
    expect(screen.getByText("2024")).toBeDefined();
    expect(screen.getByText("Sum (siste 2 år)")).toBeDefined();
  });

  it("filtrerer ut rader uten næringsinntekt", () => {
    const næringsinntekt: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 128000, lønnsinntekt: 0 },
      { inntektsår: "2023", næringsinntekt: 0, lønnsinntekt: 200000 },
    ];
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={lagInntektInformasjon()}
        pensjonsgivendeInntekt={næringsinntekt}
        harNæringsinntektKilde={true}
      />,
    );

    expect(screen.getByText("2024")).toBeDefined();
    expect(screen.queryByText("2023")).toBeNull();
  });

  it("viser tom-melding når næringsinntekt er en bekreftet tom liste", () => {
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={lagInntektInformasjon()}
        pensjonsgivendeInntekt={[]}
        harNæringsinntektKilde={true}
      />,
    );

    expect(screen.getByText("Ingen næringsinntekt registrert.")).toBeDefined();
  });

  it("viser feilmelding (lang variant) når næringsinntekt er null og lønnsinntekt finnes", () => {
    const inntektInformasjon = lagInntektInformasjon({
      lønnsinntekt: [
        {
          arbeidsgiver: "Firma AS",
          periode: nyligPeriode,
          arbeidsforhold: "1",
          stillingsprosent: "100",
          lønnstype: "Fastlønn",
          antall: null,
          beløp: 50000,
          harFlereVersjoner: false,
        },
      ],
    });
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={inntektInformasjon}
        pensjonsgivendeInntekt={null}
        harNæringsinntektKilde={true}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent ===
          "Kunne ikke hente næringsinntekt — Samlet inntekt under viser kun lønnsinntekt.",
      ),
    ).toBeDefined();
    expect(screen.queryByText("Ingen næringsinntekt registrert.")).toBeNull();
  });

  it("viser feilmelding (kort variant) når næringsinntekt feiler og lønnsinntekt er tom", () => {
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={lagInntektInformasjon()}
        pensjonsgivendeInntekt={null}
        harNæringsinntektKilde={true}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === "Kunne ikke hente næringsinntekt.",
      ),
    ).toBeDefined();
  });

  it("viser ikke næringsinntekt-seksjonen når kilden ikke ble forespurt (feature-flagg av)", () => {
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={lagInntektInformasjon()}
        pensjonsgivendeInntekt={null}
        harNæringsinntektKilde={false}
      />,
    );

    expect(screen.queryByText("Næringsinntekt")).toBeNull();
  });

  it("viser advarsel når inntektInformasjon er null, uavhengig av næringsinntekt-status", () => {
    const næringsinntekt: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 128000, lønnsinntekt: 0 },
    ];
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={null}
        pensjonsgivendeInntekt={næringsinntekt}
        harNæringsinntektKilde={true}
      />,
    );

    expect(
      screen.getByText("Kunne ikke hente inntektsdata. Prøv igjen senere."),
    ).toBeDefined();
    // Næringsinntekt-seksjonen skal likevel vises uavhengig av lønn-status
    expect(
      screen.getByRole("heading", { name: "Næringsinntekt" }),
    ).toBeDefined();
    expect(screen.getByText("2024")).toBeDefined();
  });

  it("viser Samlet inntekt-kort med lønn/næring-legend når begge finnes", () => {
    const inntektInformasjon = lagInntektInformasjon({
      lønnsinntekt: [
        {
          arbeidsgiver: "Firma AS",
          periode: nyligPeriode,
          arbeidsforhold: "1",
          stillingsprosent: "100",
          lønnstype: "Fastlønn",
          antall: null,
          beløp: 50000,
          harFlereVersjoner: false,
        },
      ],
    });
    const næringsinntekt: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 20000, lønnsinntekt: 0 },
    ];
    render(
      <InntektsoppsummeringPanelInnhold
        inntektInformasjon={inntektInformasjon}
        pensjonsgivendeInntekt={næringsinntekt}
        harNæringsinntektKilde={true}
      />,
    );

    expect(
      screen.getByText(
        "Samlet inntekt (siste 3 år): lønnsinntekt + næringsinntekt",
      ),
    ).toBeDefined();
    expect(screen.getByText(/Lønnsinntekt/)).toBeDefined();
    expect(screen.getByText(/Næringsinntekt 20 000 kr/)).toBeDefined();
  });
});

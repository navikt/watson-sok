import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PensjonsgivendeInntekt } from "./domene";
import { NæringsInntektPanelInnhold } from "./NæringsInntektPanel";

describe("NæringsInntektPanel", () => {
  it("viser næringsinntekt per år", () => {
    const data: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 380000, lønnsinntekt: 0 },
      { inntektsår: "2023", næringsinntekt: 420000, lønnsinntekt: 50000 },
    ];
    render(<NæringsInntektPanelInnhold data={data} />);

    expect(screen.getByText("2024")).toBeDefined();
    expect(screen.getByText("2023")).toBeDefined();
  });

  it("viser lønnsinntekt kun når den er over 0", () => {
    const data: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 380000, lønnsinntekt: 0 },
    ];
    render(<NæringsInntektPanelInnhold data={data} />);

    expect(screen.getByText("2024")).toBeDefined();
    expect(screen.getByText("–")).toBeDefined();
  });

  it("viser tom-melding når ingen næringsinntekt", () => {
    render(<NæringsInntektPanelInnhold data={[]} />);

    expect(screen.getByText("Ingen næringsinntekt registrert.")).toBeDefined();
  });

  it("viser tom-melding når data er null", () => {
    render(<NæringsInntektPanelInnhold data={null} />);

    expect(screen.getByText("Ingen næringsinntekt registrert.")).toBeDefined();
  });

  it("filtrerer ut rader uten næringsinntekt", () => {
    const data: PensjonsgivendeInntekt[] = [
      { inntektsår: "2024", næringsinntekt: 380000, lønnsinntekt: 0 },
      { inntektsår: "2023", næringsinntekt: 0, lønnsinntekt: 200000 },
    ];
    render(<NæringsInntektPanelInnhold data={data} />);

    expect(screen.getByText("2024")).toBeDefined();
    expect(screen.queryByText("2023")).toBeNull();
  });
});

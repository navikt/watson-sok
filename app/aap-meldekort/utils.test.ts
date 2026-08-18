import { describe, expect, it } from "vitest";

import type { AapMeldekortRespons } from "./domene";
import { filtrerAapVedtakSomOverlapperPeriode } from "./utils";

function lagVedtak(
  vedtakId: string,
  fraOgMed: string,
  tilOgMed: string | null,
): AapMeldekortRespons[number] {
  return {
    vedtakId,
    status: "LØPENDE",
    saksnummer: `SAK-${vedtakId}`,
    vedtakPeriode: { fraOgMed, tilOgMed },
    rettighetsType: "BISTANDSBEHOV",
    kide: "KELVIN",
    tema: "AAP",
    vedtaktypeNavn: null,
    perioder: [],
  };
}

describe("filtrerAapVedtakSomOverlapperPeriode", () => {
  it("inkluderer vedtak som overlapper perioden", () => {
    const vedtak = [
      lagVedtak("1", "2024-01-01", "2024-06-30"),
      lagVedtak("2", "2025-01-01", "2025-06-30"),
    ];

    const resultat = filtrerAapVedtakSomOverlapperPeriode(
      vedtak,
      "2025-01-01",
      "2025-12-31",
    );

    expect(resultat).toHaveLength(1);
    expect(resultat[0].vedtakId).toBe("2");
  });

  it("inkluderer flere overlappende vedtak i samme periode (ikke bare siste)", () => {
    const vedtak = [
      lagVedtak("1", "2025-01-01", "2025-03-31"),
      lagVedtak("2", "2025-02-01", "2025-05-31"),
    ];

    const resultat = filtrerAapVedtakSomOverlapperPeriode(
      vedtak,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultat).toHaveLength(2);
  });

  it("behandler vedtak uten sluttdato (tilOgMed null) som fortsatt løpende", () => {
    const vedtak = [lagVedtak("1", "2025-01-01", null)];

    const resultat = filtrerAapVedtakSomOverlapperPeriode(
      vedtak,
      "2026-01-01",
      "2026-01-31",
    );

    expect(resultat).toHaveLength(1);
  });

  it("returnerer tom liste når ingen vedtak overlapper", () => {
    const vedtak = [lagVedtak("1", "2023-01-01", "2023-06-30")];

    const resultat = filtrerAapVedtakSomOverlapperPeriode(
      vedtak,
      "2025-01-01",
      "2025-12-31",
    );

    expect(resultat).toHaveLength(0);
  });
});

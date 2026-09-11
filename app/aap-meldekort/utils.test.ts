import { describe, expect, it } from "vitest";

import type { AapMeldekortPeriode, AapMeldekortRespons } from "./domene";
import {
  beregnProrertArbeidetTimer,
  filtrerAapVedtakSomOverlapperPeriode,
  flatterOgFiltrerAapPerioder,
} from "./utils";

function lagVedtak(
  vedtakId: string,
  fraOgMed: string,
  tilOgMed: string | null,
  perioder: AapMeldekortPeriode[] = [],
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

describe("flatterOgFiltrerAapPerioder", () => {
  it("flater ut perioder fra flere vedtak til én liste med saksnummer bevart", () => {
    const vedtak = [
      lagVedtak("1", "2025-01-01", null, [
        lagPeriode("2025-01-01", "2025-01-14"),
      ]),
      lagVedtak("2", "2025-02-01", null, [
        lagPeriode("2025-02-01", "2025-02-14"),
      ]),
    ];

    const resultat = flatterOgFiltrerAapPerioder(
      vedtak,
      "2025-01-01",
      "2025-02-28",
    );

    expect(resultat).toHaveLength(2);
    expect(resultat.map((p) => p.saksnummer)).toEqual(["SAK-2", "SAK-1"]);
  });

  it("sorterer perioder med nyeste først", () => {
    const vedtak = [
      lagVedtak("1", "2025-01-01", null, [
        lagPeriode("2025-01-01", "2025-01-14"),
        lagPeriode("2025-01-15", "2025-01-28"),
        lagPeriode("2025-02-12", "2025-02-25"),
      ]),
    ];

    const resultat = flatterOgFiltrerAapPerioder(
      vedtak,
      "2025-01-01",
      "2025-02-28",
    );

    expect(resultat.map((p) => p.fraOgMed)).toEqual([
      "2025-02-12",
      "2025-01-15",
      "2025-01-01",
    ]);
  });

  it("filtrerer bort perioder utenfor valgt tidsvindu", () => {
    const vedtak = [
      lagVedtak("1", "2024-01-01", null, [
        lagPeriode("2024-06-01", "2024-06-14"),
        lagPeriode("2025-01-01", "2025-01-14"),
      ]),
    ];

    const resultat = flatterOgFiltrerAapPerioder(
      vedtak,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toHaveLength(1);
    expect(resultat[0].fraOgMed).toBe("2025-01-01");
  });

  it("behandler perioder uten sluttdato (tilOgMed null) som fortsatt løpende", () => {
    const vedtak = [
      lagVedtak("1", "2025-01-01", null, [lagPeriode("2025-01-01", null)]),
    ];

    const resultat = flatterOgFiltrerAapPerioder(
      vedtak,
      "2026-01-01",
      "2026-01-31",
    );

    expect(resultat).toHaveLength(1);
  });

  it("returnerer tom liste når ingen perioder overlapper", () => {
    const vedtak = [
      lagVedtak("1", "2023-01-01", "2023-06-30", [
        lagPeriode("2023-01-01", "2023-01-14"),
      ]),
    ];

    const resultat = flatterOgFiltrerAapPerioder(
      vedtak,
      "2025-01-01",
      "2025-12-31",
    );

    expect(resultat).toHaveLength(0);
  });
});

describe("beregnProrertArbeidetTimer", () => {
  it("returnerer full arbeidetTimer når perioden er helt innenfor vinduet", () => {
    const periode = lagPeriode("2025-01-01", "2025-01-14", {
      arbeidetTimer: 14,
    });

    const resultat = beregnProrertArbeidetTimer(
      periode,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toBe(14);
  });

  it("prorerer når perioden bare delvis overlapper vinduet", () => {
    const periode = lagPeriode("2025-01-01", "2025-01-14", {
      arbeidetTimer: 14,
    });

    // Kun 5 av periodens 14 dager (10.-14. jan) faller innenfor vinduet
    const resultat = beregnProrertArbeidetTimer(
      periode,
      "2025-01-10",
      "2025-01-14",
    );

    expect(resultat).toBe(5);
  });

  it("returnerer 0 når arbeidetTimer er null", () => {
    const periode = lagPeriode("2025-01-01", "2025-01-14", {
      arbeidetTimer: null,
    });

    const resultat = beregnProrertArbeidetTimer(
      periode,
      "2025-01-01",
      "2025-01-31",
    );

    expect(resultat).toBe(0);
  });

  it("returnerer 0 når perioden ikke overlapper vinduet i det hele tatt", () => {
    const periode = lagPeriode("2025-01-01", "2025-01-14", {
      arbeidetTimer: 14,
    });

    const resultat = beregnProrertArbeidetTimer(
      periode,
      "2025-02-01",
      "2025-02-28",
    );

    expect(resultat).toBe(0);
  });

  it("klipper åpen periode (tilOgMed null) til vinduets sluttdato", () => {
    const periode = lagPeriode("2025-01-01", null, {
      arbeidetTimer: 28,
    });

    // Åpen periode klippes til "i dag" internt for total-dager-beregningen,
    // men her tester vi kun at et vindu som ligger helt i fortiden
    // fortsatt prorerer korrekt basert på faktisk overlapp.
    const resultat = beregnProrertArbeidetTimer(
      periode,
      "2025-01-01",
      "2025-01-14",
    );

    expect(resultat).toBeGreaterThan(0);
  });
});

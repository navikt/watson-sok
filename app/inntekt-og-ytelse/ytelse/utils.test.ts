import { describe, expect, it } from "vitest";
import { beregnYtelseStatistikk, grupperSammenhengendePerioder } from "./utils";

function lagPeriode(fom: string, tom: string, bruttoBeløp = 1000, beløp = 800) {
  return { periode: { fom, tom }, beløp, bruttoBeløp };
}

describe("grupperSammenhengendePerioder", () => {
  it("returnerer tom liste for tom input", () => {
    expect(grupperSammenhengendePerioder([])).toEqual([]);
  });

  it("returnerer én gruppe for én periode", () => {
    const perioder = [lagPeriode("2024-01-01", "2024-01-31", 5000)];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toEqual([
      { fom: "2024-01-01", tom: "2024-01-31", totalBeløp: 5000 },
    ]);
  });

  it("grupperer perioder som er mindre enn 45 dager fra hverandre", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000),
      lagPeriode("2024-02-15", "2024-02-28", 2000), // 15 dager mellom
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toHaveLength(1);
    expect(resultat[0]).toEqual({
      fom: "2024-01-01",
      tom: "2024-02-28",
      totalBeløp: 3000,
    });
  });

  it("splitter perioder som er 45 dager eller mer fra hverandre", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000),
      lagPeriode("2024-04-01", "2024-04-30", 2000), // 60 dager mellom
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toHaveLength(2);
    expect(resultat[0]).toEqual({
      fom: "2024-01-01",
      tom: "2024-01-31",
      totalBeløp: 1000,
    });
    expect(resultat[1]).toEqual({
      fom: "2024-04-01",
      tom: "2024-04-30",
      totalBeløp: 2000,
    });
  });

  it("splitter på eksakt 45 dagers gap", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000),
      lagPeriode("2024-03-17", "2024-03-31", 2000), // Eksakt 45 dager mellom
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toHaveLength(2);
  });

  it("grupperer på 44 dagers gap", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000),
      lagPeriode("2024-03-15", "2024-03-31", 2000), // 44 dager mellom
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toHaveLength(1);
  });

  it("sorterer perioder etter startdato før gruppering", () => {
    const perioder = [
      lagPeriode("2024-03-01", "2024-03-31", 3000),
      lagPeriode("2024-01-01", "2024-01-31", 1000),
      lagPeriode("2024-02-01", "2024-02-28", 2000),
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toHaveLength(1);
    expect(resultat[0]).toEqual({
      fom: "2024-01-01",
      tom: "2024-03-31",
      totalBeløp: 6000,
    });
  });

  it("håndterer flere separate grupper", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000),
      lagPeriode("2024-02-15", "2024-02-28", 1000), // Gruppe 1
      lagPeriode("2024-06-01", "2024-06-30", 2000),
      lagPeriode("2024-07-01", "2024-07-31", 2000), // Gruppe 2
      lagPeriode("2024-12-01", "2024-12-31", 3000), // Gruppe 3
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat).toHaveLength(3);
    expect(resultat[0].totalBeløp).toBe(2000);
    expect(resultat[1].totalBeløp).toBe(4000);
    expect(resultat[2].totalBeløp).toBe(3000);
  });

  it("bruker bruttoBeløp for summering, ikke beløp", () => {
    const perioder = [
      {
        periode: { fom: "2024-01-01", tom: "2024-01-31" },
        beløp: 800,
        bruttoBeløp: 1000,
      },
      {
        periode: { fom: "2024-02-01", tom: "2024-02-28" },
        beløp: 1600,
        bruttoBeløp: 2000,
      },
    ];

    const resultat = grupperSammenhengendePerioder(perioder);

    expect(resultat[0].totalBeløp).toBe(3000); // bruttoBeløp, ikke beløp
  });
});

describe("beregnYtelseStatistikk", () => {
  it("returnerer nullverdier for tom liste", () => {
    const resultat = beregnYtelseStatistikk([]);

    expect(resultat).toEqual({
      antallUtbetalinger: 0,
      antallTilbakekrevinger: 0,
      antallPerioder: 0,
      totalBrutto: 0,
      totalNetto: 0,
    });
  });

  it("teller utbetalinger og tilbakekrevinger separat", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000, 800),
      lagPeriode("2024-02-01", "2024-02-28", 2000, 1600),
      lagPeriode("2024-03-01", "2024-03-31", 500, -500), // tilbakekreving
    ];

    const resultat = beregnYtelseStatistikk(perioder);

    expect(resultat.antallUtbetalinger).toBe(2);
    expect(resultat.antallTilbakekrevinger).toBe(1);
  });

  it("beregner total brutto og netto", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000, 800),
      lagPeriode("2024-02-01", "2024-02-28", 2000, 1500),
    ];

    const resultat = beregnYtelseStatistikk(perioder);

    expect(resultat.totalBrutto).toBe(3000);
    expect(resultat.totalNetto).toBe(2300);
  });

  it("teller unike perioder via grupperSammenhengendePerioder", () => {
    const perioder = [
      lagPeriode("2024-01-01", "2024-01-31", 1000, 800),
      lagPeriode("2024-02-01", "2024-02-28", 1000, 800), // samme gruppe
      lagPeriode("2024-06-01", "2024-06-30", 1000, 800), // ny gruppe
    ];

    const resultat = beregnYtelseStatistikk(perioder);

    expect(resultat.antallPerioder).toBe(2);
  });
});

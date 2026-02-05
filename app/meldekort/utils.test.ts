import { describe, expect, it } from "vitest";
import type { Dag } from "./domene";
import { beregnAktivitetStatistikk } from "./utils";

function lagDag(dagIndex: number, aktiviteter: Dag["aktiviteter"] = []): Dag {
  return {
    dato: `2024-01-${String(dagIndex).padStart(2, "0")}`,
    dagIndex,
    aktiviteter,
  };
}

describe("beregnAktivitetStatistikk", () => {
  it("returnerer nullverdier for tom liste", () => {
    const resultat = beregnAktivitetStatistikk([]);

    expect(resultat).toEqual({
      arbeidTimer: 0,
      ferieDager: 0,
      kursDager: 0,
      sykdomDager: 0,
    });
  });

  it("summerer arbeidstimer", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Arbeid", timer: 4 }]),
      lagDag(2, [{ id: "2", type: "Arbeid", timer: 6 }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.arbeidTimer).toBe(10);
  });

  it("teller feriedager (Fravaer)", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Fravaer" }]),
      lagDag(2, [{ id: "2", type: "Fravaer" }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.ferieDager).toBe(2);
  });

  it("teller kursdager (Utdanning)", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Utdanning" }]),
      lagDag(2, [{ id: "2", type: "Utdanning" }]),
      lagDag(3, [{ id: "3", type: "Utdanning" }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.kursDager).toBe(3);
  });

  it("teller sykdomsdager (Syk)", () => {
    const dager = [lagDag(1, [{ id: "1", type: "Syk" }])];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.sykdomDager).toBe(1);
  });

  it("håndterer null/undefined timer som 0 for arbeid", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Arbeid", timer: null }]),
      lagDag(2, [{ id: "2", type: "Arbeid", timer: undefined }]),
      lagDag(3, [{ id: "3", type: "Arbeid", timer: 5 }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.arbeidTimer).toBe(5);
  });

  it("summerer alle aktivitetstyper separat", () => {
    const dager = [
      lagDag(1, [{ id: "1", type: "Arbeid", timer: 4 }]),
      lagDag(2, [{ id: "2", type: "Fravaer" }]),
      lagDag(3, [{ id: "3", type: "Utdanning" }]),
      lagDag(4, [{ id: "4", type: "Syk" }]),
      lagDag(5, [{ id: "5", type: "Arbeid", timer: 2 }]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat).toEqual({
      arbeidTimer: 6,
      ferieDager: 1,
      kursDager: 1,
      sykdomDager: 1,
    });
  });

  it("håndterer flere aktiviteter per dag", () => {
    const dager = [
      lagDag(1, [
        { id: "1", type: "Arbeid", timer: 4 },
        { id: "2", type: "Utdanning" },
      ]),
    ];

    const resultat = beregnAktivitetStatistikk(dager);

    expect(resultat.arbeidTimer).toBe(4);
    expect(resultat.kursDager).toBe(1);
  });
});

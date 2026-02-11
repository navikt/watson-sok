import type { Dag } from "./domene";

type AktivitetStatistikk = {
  arbeidTimer: number;
  ferieDager: number;
  kursDager: number;
  sykdomDager: number;
};

/** Beregner oppsummert statistikk per aktivitetstype for en liste med dager */
export function beregnAktivitetStatistikk(dager: Dag[]): AktivitetStatistikk {
  return dager
    .flatMap((d) => d.aktiviteter)
    .reduce(
      (acc, aktivitet) => {
        switch (aktivitet.type) {
          case "Arbeid":
            acc.arbeidTimer += aktivitet.timer ?? 0;
            break;
          case "Fravaer":
            acc.ferieDager += 1;
            break;
          case "Utdanning":
            acc.kursDager += 1;
            break;
          case "Syk":
            acc.sykdomDager += 1;
            break;
        }
        return acc;
      },
      { arbeidTimer: 0, ferieDager: 0, kursDager: 0, sykdomDager: 0 },
    );
}

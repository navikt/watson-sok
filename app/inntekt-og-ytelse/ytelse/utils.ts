import { forskjellIDager } from "~/utils/date-utils";
import type { Ytelse } from "./domene";

type GruppertPeriode = {
  fom: string;
  tom: string;
  totalBeløp: number;
};

type Periode = {
  periode: { fom: string; tom: string };
  beløp: number;
  bruttoBeløp: number;
};

type YtelseStatistikk = {
  antallUtbetalinger: number;
  antallTilbakekrevinger: number;
  antallPerioder: number;
  totalBrutto: number;
  totalNetto: number;
};

/**
 * Beregner statistikk for en liste med ytelsesperioder.
 */
export function beregnYtelseStatistikk(perioder: Periode[]): YtelseStatistikk {
  const utbetalinger = perioder.filter((p) => p.beløp >= 0);
  const tilbakekrevinger = perioder.filter((p) => p.beløp < 0);
  const gruppertePerioder = grupperSammenhengendePerioder(perioder);

  const totalBrutto = perioder.reduce(
    (sum, p) => sum + (p.bruttoBeløp ?? 0),
    0,
  );
  const totalNetto = perioder.reduce((sum, p) => sum + p.beløp, 0);

  return {
    antallUtbetalinger: utbetalinger.length,
    antallTilbakekrevinger: tilbakekrevinger.length,
    antallPerioder: gruppertePerioder.length,
    totalBrutto,
    totalNetto,
  };
}

/**
 * Grupperer sammenhengende perioder som er mindre enn 45 dager fra hverandre til en enkel periode.
 * Perioder sorteres etter startdato før gruppering.
 * Beløpene for alle perioder i en gruppe summeres.
 */
export function grupperSammenhengendePerioder(
  perioder: Array<{
    periode: { fom: string; tom: string };
    beløp: number;
    bruttoBeløp: number;
  }>,
): GruppertPeriode[] {
  if (perioder.length === 0) {
    return [];
  }

  const sortertePerioder = [...perioder].sort((a, b) =>
    a.periode.fom.localeCompare(b.periode.fom),
  );

  const gruppert: GruppertPeriode[] = [];
  let nåværendeGruppe: GruppertPeriode = {
    fom: sortertePerioder[0].periode.fom,
    tom: sortertePerioder[0].periode.tom,
    totalBeløp: sortertePerioder[0].bruttoBeløp,
  };

  for (let i = 1; i < sortertePerioder.length; i++) {
    const forrigeSlutt = new Date(nåværendeGruppe.tom);
    const nåværendeStart = new Date(sortertePerioder[i].periode.fom);
    const dagerMellom = forskjellIDager(forrigeSlutt, nåværendeStart);

    if (dagerMellom < 45) {
      nåværendeGruppe.tom = sortertePerioder[i].periode.tom;
      nåværendeGruppe.totalBeløp += sortertePerioder[i].bruttoBeløp;
    } else {
      gruppert.push(nåværendeGruppe);
      nåværendeGruppe = {
        fom: sortertePerioder[i].periode.fom,
        tom: sortertePerioder[i].periode.tom,
        totalBeløp: sortertePerioder[i].bruttoBeløp,
      };
    }
  }

  gruppert.push(nåværendeGruppe);

  return gruppert;
}

export type TilbakekrevingMedYtelse = {
  stonadType: string;
  beløp: number;
  periode: { fom: string; tom: string };
  info: string | null;
};

export type GruppertTilbakekreving = {
  fom: string;
  tilbakekrevinger: TilbakekrevingMedYtelse[];
};

/**
 * Filtrerer ut tilbakekrevinger (negative beløp) fra ytelser innenfor et tidsvindu,
 * og grupperer dem per startdato (`fom`).
 */
export function grupperTilbakekrevinger(
  ytelser: Ytelse[] | null,
  vindu: { start: Date; slutt: Date },
): GruppertTilbakekreving[] {
  const alle: TilbakekrevingMedYtelse[] =
    ytelser?.flatMap((ytelse) =>
      ytelse.perioder
        .filter(
          (periode) =>
            periode.beløp < 0 &&
            new Date(periode.periode.fom) >= vindu.start &&
            new Date(periode.periode.tom) <= vindu.slutt,
        )
        .map((periode) => ({
          stonadType: ytelse.stonadType,
          beløp: periode.beløp,
          periode: periode.periode,
          info: periode.info,
        })),
    ) ?? [];

  const perDato = new Map<string, TilbakekrevingMedYtelse[]>();
  for (const t of alle) {
    const gruppe = perDato.get(t.periode.fom) ?? [];
    gruppe.push(t);
    perDato.set(t.periode.fom, gruppe);
  }

  return Array.from(perDato.entries()).map(([fom, tilbakekrevinger]) => ({
    fom,
    tilbakekrevinger,
  }));
}

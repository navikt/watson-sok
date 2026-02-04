import { forskjellIDager } from "~/utils/date-utils";

export type GruppertPeriode = {
  fom: string;
  tom: string;
  totalBeløp: number;
};

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

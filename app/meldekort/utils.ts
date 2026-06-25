import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";

import type { Dag, MeldekortRespons } from "./domene";

type AktivitetStatistikk = {
  arbeidTimer: number;
  ferieDager: number;
  kursDager: number;
  sykdomDager: number;
};

export type TimerPerMåned = {
  måned: string; // "YYYY-MM"
  mkTimer: number;
  aaTimer: number;
  harAvvik: boolean;
};

// 20 % avvik er valgt som en rimelig standard. Bør avklares med fagansvarlig.
const AVVIKSTERSKEL_PROSENT = 20;

/**
 * Sammenstiller meldekort-timer og AA-register-timer per kalendermåned.
 * Avvik markeres der differansen overstiger terskelen.
 */
export function aggregerTimerPerMåned(
  meldekort: MeldekortRespons,
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon,
  fraDato: string,
  tilDato: string,
): TimerPerMåned[] {
  return genererMåneder(fraDato, tilDato).map((måned) => {
    const mkTimer = beregnMkTimerForMåned(meldekort, måned);
    const aaTimer = beregnAaTimerForMåned(arbeidsgiverInformasjon, måned);
    return { måned, mkTimer, aaTimer, harAvvik: harTimerAvvik(mkTimer, aaTimer) };
  });
}

function genererMåneder(fraDato: string, tilDato: string): string[] {
  const måneder: string[] = [];
  const til = new Date(tilDato);
  const gjeldende = new Date(
    new Date(fraDato).getFullYear(),
    new Date(fraDato).getMonth(),
    1,
  );

  while (gjeldende <= til) {
    måneder.push(
      `${gjeldende.getFullYear()}-${String(gjeldende.getMonth() + 1).padStart(2, "0")}`,
    );
    gjeldende.setMonth(gjeldende.getMonth() + 1);
  }
  return måneder;
}

function beregnMkTimerForMåned(
  meldekort: MeldekortRespons,
  måned: string,
): number {
  return meldekort
    .flatMap((mk) => mk.dager)
    .filter((dag) => dag.dato?.startsWith(måned))
    .flatMap((dag) => dag.aktiviteter)
    .filter((aktivitet) => aktivitet.type === "Arbeid")
    .reduce((sum, aktivitet) => sum + (aktivitet.timer ?? 0), 0);
}

function beregnAaTimerForMåned(
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon,
  måned: string,
): number {
  const [år, mnd] = måned.split("-").map(Number);
  const førsteDag = new Date(år, mnd - 1, 1);
  const sisteDag = new Date(år, mnd, 0);
  // Antall uker i måneden basert på antall dager
  const antallUker = sisteDag.getDate() / 7;

  let totalTimer = 0;

  for (const forhold of arbeidsgiverInformasjon.løpendeArbeidsforhold) {
    for (const detalj of forhold.ansettelsesDetaljer) {
      if (!detalj.antallTimerPrUke) continue;

      const fom = new Date(detalj.periode.fom);
      const tom = detalj.periode.tom ? new Date(detalj.periode.tom) : null;

      const erAktivIMåned = fom <= sisteDag && (tom === null || tom >= førsteDag);
      if (erAktivIMåned) {
        totalTimer += detalj.antallTimerPrUke * antallUker;
      }
    }
  }

  return totalTimer;
}

function harTimerAvvik(mkTimer: number, aaTimer: number): boolean {
  if (aaTimer === 0) return mkTimer > 0;
  return (Math.abs(aaTimer - mkTimer) / aaTimer) * 100 >= AVVIKSTERSKEL_PROSENT;
}

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

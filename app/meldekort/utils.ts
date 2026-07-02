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

// 5 % avvik er avklart med fagansvarlig som rimelig terskel (ref. SEARCH-28).
const AVVIKSTERSKEL_PROSENT = 5;

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
    return {
      måned,
      mkTimer,
      aaTimer,
      harAvvik: harTimerAvvik(mkTimer, aaTimer),
    };
  });
}

/** Parser en "YYYY-MM-DD"- eller "YYYY-MM"-streng som lokal dato, unngår UTC-forskyvning. */
function parseDatoLokal(datoStreng: string): Date {
  const deler = datoStreng.split("-").map(Number);
  const [år, mnd, dag = 1] = deler;
  return new Date(år, mnd - 1, dag);
}

/** Parser "YYYY-MM" som siste dag i måneden (brukes for tom-dato). */
function parseMånedSlutt(datoStreng: string): Date {
  const [år, mnd] = datoStreng.split("-").map(Number);
  return new Date(år, mnd, 0); // dag 0 = siste dag i forrige måned
}

function genererMåneder(fraDato: string, tilDato: string): string[] {
  const måneder: string[] = [];
  const fra = parseDatoLokal(fraDato);
  const til = parseDatoLokal(tilDato);
  const gjeldende = new Date(fra.getFullYear(), fra.getMonth(), 1);

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

  let totalTimer = 0;

  for (const forhold of arbeidsgiverInformasjon.løpendeArbeidsforhold) {
    // Bruk timerMedTimeloenn (faktisk timelønnet-data per måned) når tilgjengelig.
    // Faller tilbake til antallTimerPrUke (kontraktstimer) hvis ikke eksponert av backend ennå.
    if (forhold.timerMedTimeloenn && forhold.timerMedTimeloenn.length > 0) {
      for (const timerEntry of forhold.timerMedTimeloenn) {
        if (!timerEntry.fraOgMed) continue;

        const fom = parseDatoLokal(timerEntry.fraOgMed + "-01");
        const tom = timerEntry.tilOgMed
          ? parseMånedSlutt(timerEntry.tilOgMed)
          : null;

        const erAktivIMåned =
          fom <= sisteDag && (tom === null || tom >= førsteDag);
        if (!erAktivIMåned) continue;

        const effektivFom = fom > førsteDag ? fom : førsteDag;
        const effektivTom = tom !== null && tom < sisteDag ? tom : sisteDag;
        const antallDager = effektivTom.getDate() - effektivFom.getDate() + 1;
        const antallUker = antallDager / 7;

        totalTimer += timerEntry.antall * antallUker;
      }
    } else {
      for (const detalj of forhold.ansettelsesDetaljer) {
        if (!detalj.antallTimerPrUke) continue;

        const fom = parseDatoLokal(detalj.periode.fom);
        const tom = detalj.periode.tom
          ? parseMånedSlutt(detalj.periode.tom)
          : null;

        const erAktivIMåned =
          fom <= sisteDag && (tom === null || tom >= førsteDag);
        if (!erAktivIMåned) continue;

        // Pro-rater basert på faktiske dager — effektivFom/Tom er alltid i samme måned
        // så getDate()-diff er DST-sikker og unngår ms-aritmetikk
        const effektivFom = fom > førsteDag ? fom : førsteDag;
        const effektivTom = tom !== null && tom < sisteDag ? tom : sisteDag;
        const antallDager = effektivTom.getDate() - effektivFom.getDate() + 1;
        const antallUker = antallDager / 7;

        totalTimer += detalj.antallTimerPrUke * antallUker;
      }
    }
  }

  return totalTimer;
}

function harTimerAvvik(mkTimer: number, aaTimer: number): boolean {
  if (aaTimer === 0) return false; // Ingen AA-timer å sammenligne med
  if (mkTimer === 0) return false; // Ingen meldekort-timer — ikke sammenlignbart
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

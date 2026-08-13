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

type Arbeidsforhold = ArbeidsgiverInformasjon["løpendeArbeidsforhold"][number];

function harTimeloennIForhold(
  forhold: Arbeidsforhold,
): forhold is Arbeidsforhold & {
  timerMedTimeloenn: NonNullable<Arbeidsforhold["timerMedTimeloenn"]>;
} {
  return (
    forhold.timerMedTimeloenn != null && forhold.timerMedTimeloenn.length > 0
  );
}

/**
 * Returnerer true dersom personen har innrapporterte timelønnet-timer
 * i minst ett løpende arbeidsforhold. Brukes til å skjule AA-timer-grafen
 * for fastlønnede der antallTimerPrUke ikke er faktisk innrapporterte timer.
 */
export function erTimelønnet(
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon,
): boolean {
  return (
    arbeidsgiverInformasjon.løpendeArbeidsforhold.some(harTimeloennIForhold) ||
    arbeidsgiverInformasjon.historikk.some(harTimeloennIForhold)
  );
}

/**
 * Filtrerer meldekort som overlapper med en gitt periode (fom/tom).
 * Et meldekort regnes som overlappende dersom det ikke er avsluttet før
 * periodens start, og ikke starter etter periodens slutt.
 */
export function filtrerMeldekortSomOverlapperPeriode(
  meldekort: MeldekortRespons,
  fom: string,
  tom: string,
): MeldekortRespons {
  const fra = new Date(fom);
  const til = new Date(tom);
  return meldekort.filter(
    (m) =>
      new Date(m.periode.tilOgMed) >= fra &&
      new Date(m.periode.fraOgMed) <= til,
  );
}

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

  for (const forhold of [
    ...arbeidsgiverInformasjon.løpendeArbeidsforhold,
    ...arbeidsgiverInformasjon.historikk,
  ]) {
    // Hvis timerMedTimeloenn er definert og ikke-tom er personen timelønnet.
    // Da bruker vi aldri antallTimerPrUke som fallback — måneder uten data gir 0.
    if (harTimeloennIForhold(forhold)) {
      const aktiveTimeloennEntries = forhold.timerMedTimeloenn.filter(
        (timerEntry) => {
          if (!timerEntry.startdato) return false;
          const fom = parseDatoLokal(timerEntry.startdato);
          const tom = timerEntry.sluttdato
            ? parseDatoLokal(timerEntry.sluttdato)
            : null;
          return fom <= sisteDag && (tom === null || tom >= førsteDag);
        },
      );

      for (const timerEntry of aktiveTimeloennEntries) {
        if (!timerEntry.startdato) continue;
        const fom = parseDatoLokal(timerEntry.startdato);
        const tom = timerEntry.sluttdato
          ? parseDatoLokal(timerEntry.sluttdato)
          : null;

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

import type { AapMeldekortRespons } from "~/aap-meldekort/domene";
import type {
  ArbeidsgiverInformasjon,
  TimerMedTimeloenn,
} from "~/arbeidsforhold/domene";

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
  // Krever minst én oppføring med enten startdato ELLER rapporteringsmaaneder
  // — Aareg kan returnere en ikke-tom liste der alle oppføringene mangler
  // begge deler (ubrukelige datapunkter). Uten denne sjekken ville forholdet
  // feilaktig blitt klassifisert som timelønnet, men aktiveTimeloennEntries
  // ville alltid blitt tom, og AA-timer ville stille vist 0 selv om personen
  // har en reell, fast ansettelse (se ansettelsesDetaljer/antallTimerPrUke).
  //
  // Motsatt: hvis MINST ÉN oppføring har rapporteringsmaaneder (selv uten
  // startdato), skal forholdet regnes som timelønnet — ellers faller HELE
  // forholdet feilaktig tilbake til antallTimerPrUke (full stillingsprosent)
  // for alle måneder, som kan gi mange ganger for høye AA-timer sammenlignet
  // med de faktisk rapporterte timelønnet-timene (se regresjonstest).
  return (
    forhold.timerMedTimeloenn != null &&
    forhold.timerMedTimeloenn.some(
      (entry) => entry.startdato != null || entry.rapporteringsmaaneder != null,
    )
  );
}

/**
 * Fjerner duplikate ansettelsesDetaljer-oppføringer (identisk innhold).
 * Aareg kan i sjeldne tilfeller returnere samme detalj flere ganger for
 * samme arbeidsforhold — uten deduplisering ville AA-timer blitt telt
 * dobbelt/tredobbelt for den overlappende perioden.
 */
function dedupliserAnsettelsesDetaljer<T>(detaljer: T[]): T[] {
  const sett = new Set<string>();
  const unike: T[] = [];
  for (const detalj of detaljer) {
    const nøkkel = JSON.stringify(detalj);
    if (!sett.has(nøkkel)) {
      sett.add(nøkkel);
      unike.push(detalj);
    }
  }
  return unike;
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

/**
 * Sammenstiller AAP-meldekort-timer (arbeidetTimer på tvers av alle vedtak)
 * og AA-register-timer per kalendermåned.
 *
 * Merk: aggregeringen skjer på PERSON-/månedsnivå, ikke per vedtak — en
 * person kan ha flere overlappende AAP-vedtak (f.eks. ved rettighetsType-
 * bytte), og AA-timer-grunnlaget (arbeidsgiverInformasjon) er uansett
 * felles for hele personen. Å vise én sammenligningsgraf per vedtak ville
 * gitt samme AA-timer-tall gjentatt i flere grafer og et misvisende
 * inntrykk av separate avvik.
 */
export function aggregerAapTimerPerMåned(
  aapVedtak: AapMeldekortRespons,
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon,
  fraDato: string,
  tilDato: string,
): TimerPerMåned[] {
  return genererMåneder(fraDato, tilDato).map((måned) => {
    const mkTimer = beregnAapTimerForMåned(aapVedtak, måned);
    const aaTimer = beregnAaTimerForMåned(arbeidsgiverInformasjon, måned);
    return {
      måned,
      mkTimer,
      aaTimer,
      harAvvik: harTimerAvvik(mkTimer, aaTimer),
    };
  });
}

/**
 * Summerer arbeidetTimer fra AAP-meldekortperioder (allerede aggregert per
 * ~14 dager av backend) som overlapper en gitt måned, på tvers av alle
 * vedtak. Perioder som strekker seg over månedsskifte pro-rateres på
 * andelen dager som faller i måneden — samme periodetotal-prinsipp som
 * brukes for timerMedTimeloenn (se beregnAaTimerForMåned).
 */
function beregnAapTimerForMåned(
  aapVedtak: AapMeldekortRespons,
  måned: string,
): number {
  const [år, mnd] = måned.split("-").map(Number);
  const førsteDag = new Date(år, mnd - 1, 1);
  const sisteDag = new Date(år, mnd, 0);

  let totalTimer = 0;

  for (const vedtak of aapVedtak) {
    for (const periode of vedtak.perioder) {
      if (!periode.arbeidetTimer) continue;

      const fom = parseDatoLokal(periode.fraOgMed);
      // tilOgMed==null betyr en ÅPEN periode (løper fra fraOgMed og videre
      // uten kjent sluttdato per Kelvin sin konvensjon) — IKKE en éndags-
      // periode. Klipp til i dag som foreløpig grense for pro-rateringen,
      // samme prinsipp som brukes andre steder for åpne perioder/vinduer.
      const tom = periode.tilOgMed
        ? parseDatoLokal(periode.tilOgMed)
        : new Date();

      const erAktivIMåned = fom <= sisteDag && tom >= førsteDag;
      if (!erAktivIMåned) continue;

      const effektivFom = fom > førsteDag ? fom : førsteDag;
      const effektivTom = tom < sisteDag ? tom : sisteDag;

      const totalDagerIPeriode =
        Math.round((tom.getTime() - fom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (totalDagerIPeriode <= 0) continue;

      const overlappendeDager =
        Math.round(
          (effektivTom.getTime() - effektivFom.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      totalTimer +=
        periode.arbeidetTimer * (overlappendeDager / totalDagerIPeriode);
    }
  }

  return totalTimer;
}

/** Parser en "YYYY-MM-DD"- eller "YYYY-MM"-streng som lokal dato, unngår UTC-forskyvning. */
function parseDatoLokal(datoStreng: string): Date {
  const deler = datoStreng.split("-").map(Number);
  const [år, mnd, dag = 1] = deler;
  return new Date(år, mnd - 1, dag);
}

/** Returnerer siste dag i en gitt "YYYY-MM"-måned. */
function sisteDagIÅrMåned(årMåned: string): Date {
  const [år, mnd] = årMåned.split("-").map(Number);
  return new Date(år, mnd, 0);
}

/**
 * Bestemmer effektiv fom/tom for en timerMedTimeloenn-oppføring, med
 * rapporteringsmaaneder som fallback når startdato/sluttdato mangler.
 *
 * - Har oppføringen startdato: bruk eksakte dager (uendret oppførsel).
 *   tom=null betyr en genuint ÅPEN periode (ukjent sluttdato).
 * - Mangler startdato, men har rapporteringsmaaneder: bruk hele
 *   kalendermåned(e) fra `fom`-måneden til og med `tom`-måneden (eller kun
 *   `fom`-måneden hvis `tom` er null) — ALDRI en åpen periode, siden
 *   rapporteringsmaaneder alltid representerer avgrensede måneder.
 * - Har verken deler: `null` (ubrukelig datapunkt, skal ikke telles).
 */
function hentEffektivPeriodeForTimerEntry(
  timerEntry: TimerMedTimeloenn,
): { fom: Date; tom: Date | null } | null {
  if (timerEntry.startdato) {
    return {
      fom: parseDatoLokal(timerEntry.startdato),
      tom: timerEntry.sluttdato ? parseDatoLokal(timerEntry.sluttdato) : null,
    };
  }
  if (timerEntry.rapporteringsmaaneder) {
    const { fom: fraMåned, tom: tilMåned } = timerEntry.rapporteringsmaaneder;
    return {
      fom: parseDatoLokal(fraMåned),
      tom: sisteDagIÅrMåned(tilMåned ?? fraMåned),
    };
  }
  return null;
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
      for (const timerEntry of forhold.timerMedTimeloenn) {
        const periode = hentEffektivPeriodeForTimerEntry(timerEntry);
        if (!periode) continue; // Verken startdato eller rapporteringsmaaneder — ubrukelig datapunkt
        const { fom, tom } = periode;

        if (fom > sisteDag || (tom !== null && tom < førsteDag)) continue;

        const effektivFom = fom > førsteDag ? fom : førsteDag;
        const effektivTom = tom !== null && tom < sisteDag ? tom : sisteDag;
        // getDate()-diff er trygt fordi effektivFom/Tom alltid er i samme måned
        const overlappendeDager =
          effektivTom.getDate() - effektivFom.getDate() + 1;

        if (tom !== null) {
          // antall = totale timer for perioden fom→tom (a-ordningen
          // rapporterer periodetotaler, ikke uketimer — det samme gjelder
          // rapporteringsmaaneder-fallback, som alltid representerer hele
          // kalendermåneder). Pro-rater på andelen av perioden som faller
          // i denne måneden.
          const totalDagerIPeriode =
            Math.round(
              (tom.getTime() - fom.getTime()) / (1000 * 60 * 60 * 24),
            ) + 1;
          if (totalDagerIPeriode <= 0) continue;
          totalTimer +=
            timerEntry.antall * (overlappendeDager / totalDagerIPeriode);
        } else {
          // Åpen periode (sluttdato mangler) — semantikken er uklar, bruk
          // ukentlig pro-ratering som fallback inntil Aareg-konvensjonen
          // for slike innslag er avklart.
          totalTimer += timerEntry.antall * (overlappendeDager / 7);
        }
      }
    } else {
      for (const detalj of dedupliserAnsettelsesDetaljer(
        forhold.ansettelsesDetaljer,
      )) {
        if (!detalj.antallTimerPrUke) continue;

        // periode.fom/tom har dag-presisjon (LocalDate fra backend) —
        // bruk parseDatoLokal for begge, ikke rund tom ned til månedsslutt.
        const fom = parseDatoLokal(detalj.periode.fom);
        const tom = detalj.periode.tom
          ? parseDatoLokal(detalj.periode.tom)
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

import type { AapMeldekortPeriode, AapMeldekortRespons } from "./domene";

/** Parser en "YYYY-MM-DD"-streng som lokal dato, unngår UTC-forskyvning
 * (new Date("YYYY-MM-DD") parses som UTC i JS, som kan gi off-by-one-dager
 * avhengig av tidssone). Samme mønster som brukes i meldekort/utils.ts.
 *
 * Eksportert slik at alle steder i aap-meldekort-modulen som håndterer
 * "YYYY-MM-DD"-strenger (komponenter, ikke bare utils) bruker samme
 * korrekte parsing — se Copilot-kommentar om UTC-bug i
 * IndividuelleAapMeldekortAccordion.tsx.
 */
export function parseDatoLokal(datoStreng: string): Date {
  const [år, mnd, dag] = datoStreng.split("-").map(Number);
  return new Date(år, mnd - 1, dag);
}

/** Antall dager mellom to datoer, inklusiv begge endepunkter. */
function antallDagerInklusive(fra: Date, til: Date): number {
  return (
    Math.round((til.getTime() - fra.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
}

/**
 * Filtrerer AAP-vedtak som overlapper med en gitt periode (fom/tom), basert
 * på vedtakets egen periode (vedtakPeriode), ikke de enkelte
 * meldekortperiodene. Et vedtak uten sluttdato (tilOgMed er null/undefined)
 * regnes som fortsatt løpende.
 */
export function filtrerAapVedtakSomOverlapperPeriode(
  vedtak: AapMeldekortRespons,
  fom: string,
  tom: string,
): AapMeldekortRespons {
  const fra = parseDatoLokal(fom);
  const til = parseDatoLokal(tom);
  return vedtak.filter((v) => {
    const vedtakFom = parseDatoLokal(v.vedtakPeriode.fraOgMed);
    const vedtakTom = v.vedtakPeriode.tilOgMed
      ? parseDatoLokal(v.vedtakPeriode.tilOgMed)
      : null;
    return (vedtakTom === null || vedtakTom >= fra) && vedtakFom <= til;
  });
}

/** En enkelt AAP-meldekortperiode (~14 dager) med vedtaket den tilhører
 * bevart for sporbarhet (visning av saksnummer, gruppering osv.). */
export type FlatAapPeriode = AapMeldekortPeriode & {
  vedtakId: string;
  saksnummer: string;
};

/**
 * Flater ut periodene fra alle AAP-vedtak til én liste (perioder kan komme
 * fra flere vedtak, f.eks. ved rettighetsType-bytte), filtrerer til periodene
 * som overlapper med [fraDato, tilDato], og sorterer nyeste periode først.
 *
 * Perioder uten sluttdato (tilOgMed er null) behandles som fortsatt løpende,
 * samme konvensjon som `filtrerAapVedtakSomOverlapperPeriode`.
 */
export function flatterOgFiltrerAapPerioder(
  vedtak: AapMeldekortRespons,
  fraDato: string,
  tilDato: string,
): FlatAapPeriode[] {
  const fra = parseDatoLokal(fraDato);
  const til = parseDatoLokal(tilDato);

  return vedtak
    .flatMap((v) =>
      v.perioder.map((periode) => ({
        ...periode,
        vedtakId: v.vedtakId,
        saksnummer: v.saksnummer,
      })),
    )
    .filter((periode) => {
      const periodeFra = parseDatoLokal(periode.fraOgMed);
      const periodeTil = periode.tilOgMed
        ? parseDatoLokal(periode.tilOgMed)
        : null;
      return (periodeTil === null || periodeTil >= fra) && periodeFra <= til;
    })
    .sort((a, b) => b.fraOgMed.localeCompare(a.fraOgMed));
}

/**
 * Beregner prorert `arbeidetTimer` for en periode som overlapper et gitt
 * vindu (fraDato/tilDato) — samme prinsipp som `beregnAapTimerForMåned` i
 * `~/meldekort/utils.ts`, men generalisert til et vilkårlig vindu i stedet
 * for kun kalendermåneder.
 *
 * Uten dette ville en periode som strekker seg utenfor vinduet (f.eks. en
 * 14-dagers periode som bare delvis overlapper valgt tidsvindu) bidra med
 * SIN FULLE arbeidetTimer-verdi til en sum merket "Totalt fra {vinduFra}
 * til {vinduTil}" — inkludert timer fra dager utenfor vinduet.
 *
 * Returnerer 0 hvis periodens `arbeidetTimer` er null (manglende data
 * behandles som "ingen timer å prorere", IKKE som en reell nullverdi —
 * kalleren må selv holde styr på om NOEN periode i settet har reell data,
 * f.eks. via en egen `harRelevantData`-sjekk, hvis det skillet er viktig).
 */
export function beregnProrertArbeidetTimer(
  periode: Pick<AapMeldekortPeriode, "fraOgMed" | "tilOgMed" | "arbeidetTimer">,
  vinduFraDato: string,
  vinduTilDato: string,
): number {
  if (periode.arbeidetTimer == null) {
    return 0;
  }

  const periodeFra = parseDatoLokal(periode.fraOgMed);
  // Åpen periode (tilOgMed null): klipp til i dag, samme konvensjon som
  // beregnAapTimerForMåned og andre steder i kodebasen.
  const periodeTil = periode.tilOgMed
    ? parseDatoLokal(periode.tilOgMed)
    : new Date();
  const vinduFra = parseDatoLokal(vinduFraDato);
  const vinduTil = parseDatoLokal(vinduTilDato);

  const effektivFra = periodeFra > vinduFra ? periodeFra : vinduFra;
  const effektivTil = periodeTil < vinduTil ? periodeTil : vinduTil;

  const totalDagerIPeriode = antallDagerInklusive(periodeFra, periodeTil);
  if (totalDagerIPeriode <= 0) {
    return 0;
  }

  const overlappendeDager = antallDagerInklusive(effektivFra, effektivTil);
  if (overlappendeDager <= 0) {
    return 0;
  }

  return periode.arbeidetTimer * (overlappendeDager / totalDagerIPeriode);
}

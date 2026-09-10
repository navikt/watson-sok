import type { AapMeldekortPeriode, AapMeldekortRespons } from "./domene";

/** Parser en "YYYY-MM-DD"-streng som lokal dato, unngår UTC-forskyvning
 * (new Date("YYYY-MM-DD") parses som UTC i JS, som kan gi off-by-one-dager
 * avhengig av tidssone). Samme mønster som brukes i meldekort/utils.ts.
 */
function parseDatoLokal(datoStreng: string): Date {
  const [år, mnd, dag] = datoStreng.split("-").map(Number);
  return new Date(år, mnd - 1, dag);
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

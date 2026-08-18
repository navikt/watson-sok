import type { AapMeldekortRespons } from "./domene";

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

import type { AapMeldekortRespons } from "./domene";

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
  const fra = new Date(fom);
  const til = new Date(tom);
  return vedtak.filter((v) => {
    const vedtakFom = new Date(v.vedtakPeriode.fraOgMed);
    const vedtakTom = v.vedtakPeriode.tilOgMed
      ? new Date(v.vedtakPeriode.tilOgMed)
      : null;
    return (vedtakTom === null || vedtakTom >= fra) && vedtakFom <= til;
  });
}

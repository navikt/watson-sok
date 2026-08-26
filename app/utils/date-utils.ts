/**
 * Formaterer en "YYYY-MM"-streng til "mån. år"
 *
 * @example
 * formaterÅrMåned("2025-01") // "jan. 2025"
 * formaterÅrMåned("2025-02") // "feb. 2025"
 * formaterÅrMåned("2025-03") // "mars 2025"
 */
export function formaterÅrMåned(årMåned: string | null | undefined) {
  if (!årMåned || !årMåned.match(/^\d{4}-\d{2}$/)) {
    return "–";
  }
  try {
    const formaterer = new Intl.DateTimeFormat("nb-NO", {
      month: "long",
      year: "numeric",
    });
    return formaterer.format(new Date(`${årMåned}-01`));
  } catch {
    return årMåned;
  }
}

/**
 * Formaterer en ISO-datostreng (YYYY-MM-DD) til norsk format (d. MMM yyyy)
 *
 * @example
 * formaterDato("2023-01-15") // "15. jan. 2023"
 * formaterDato("2023-12-31") // "31. des. 2023"
 */
export function formaterDato(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const formaterer = new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formaterer.format(date);
  } catch {
    return isoDate;
  }
}

export function formaterTilIsoDato(dato: Date): string {
  // Dette returnerer en streng i formatet "YYYY-MM-DD"
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dato);
}

/**
 * Kalkulerer hvor mange hele dater det er mellom to datoer
 *
 * Datoene man sender inn kan være ISO-timestamps, eller datoobjekter.
 *
 * @example
 * ```tsx
 * forskjellIDager("2025-01-01", "2025-01-02") // 1
 * forskjellIDager("2025-01-01", new Date("2025-01-02")) // 1
 * forskjellIDager(new Date("2025-01-01"), "2025-01-02") // 1
 * forskjellIDager(new Date("2025-01-01"), new Date("2025-01-02")) // 1
 * ```
 */
export function forskjellIDager(fom: string | Date, tom: string | Date) {
  const fomDato = new Date(fom);
  const tomDato = new Date(tom);
  return Math.floor(
    Math.abs(fomDato.getTime() - tomDato.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Returnerer ISO 8601-ukenummer (1-53) for en gitt dato, i tråd med norsk
 * ukenummerering (uke starter mandag, uke 1 er uken med årets første torsdag).
 *
 * @example
 * ukenummer("2025-01-01") // 1
 * ukenummer(new Date("2025-12-29")) // 1 (tilhører uke 1 i 2026)
 */
export function ukenummer(dato: string | Date): number {
  const d = new Date(
    Date.UTC(
      new Date(dato).getFullYear(),
      new Date(dato).getMonth(),
      new Date(dato).getDate(),
    ),
  );
  // ISO 8601: mandag = 1 ... søndag = 7. Flytt til nærmeste torsdag i samme uke.
  const ukedag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - ukedag);
  const årsstart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - årsstart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Formaterer et 14-dagers meldekortintervall med ukenummer, f.eks.
 * "1. sep – 14. sep 2025 (uke 36–37)". Bruker samme ukenummer for
 * fra- og til-dato hvis perioden ikke krysser et ukeskille.
 */
export function formaterMeldekortperiodeMedUke(
  fraOgMed: string,
  tilOgMed: string,
): string {
  const fraUke = ukenummer(fraOgMed);
  const tilUke = ukenummer(tilOgMed);
  const ukeTekst =
    fraUke === tilUke ? `uke ${fraUke}` : `uke ${fraUke}–${tilUke}`;
  return `${formaterDato(fraOgMed)} – ${formaterDato(tilOgMed)} (${ukeTekst})`;
}

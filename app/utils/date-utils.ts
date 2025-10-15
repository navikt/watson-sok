/**
 * Formatterer en "YYYY-MM"-streng til "mån. år"
 *
 * @example
 * formatÅrMåned("2025-01") // "jan. 2025"
 * formatÅrMåned("2025-02") // "feb. 2025"
 * formatÅrMåned("2025-03") // "mars 2025"
 */
export function formatÅrMåned(årMåned: string | null | undefined) {
  if (!årMåned || !årMåned.match(/^\d{4}-\d{2}$/)) {
    return "–";
  }
  try {
    const formatter = new Intl.DateTimeFormat("nb-NO", {
      month: "short",
      year: "numeric",
    });
    return formatter.format(new Date(`${årMåned}-01`));
  } catch {
    return årMåned;
  }
}

/**
 * Formatterer en ISO-datostreng (YYYY-MM-DD) til norsk format (d. MMM yyyy)
 *
 * @example
 * formatterDato("2023-01-15") // "15. jan. 2023"
 * formatterDato("2023-12-31") // "31. des. 2023"
 */
export function formatterDato(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const formatter = new Intl.DateTimeFormat("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatter.format(date);
  } catch {
    return isoDate;
  }
}

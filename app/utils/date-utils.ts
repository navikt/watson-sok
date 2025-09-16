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

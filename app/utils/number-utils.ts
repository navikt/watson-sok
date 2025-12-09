/**
 * Formater desimaltall
 *
 * @param tall - Tallen som skal formateres
 * @returns Formatert desimaltall
 */
export function formaterDesimaltall(
  tall: number,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string {
  return tall.toLocaleString("nb-NO", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

/**
 * Formater prosent
 *
 * @param tall - Tallen som skal formateres som prosent (mellom 0 og 100)
 * @returns Formatert prosent
 */
export function formaterProsent(tall: number | unknown): string {
  if (typeof tall !== "number") {
    return tall as string;
  }

  return (tall / 100).toLocaleString("nb-NO", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Formater beløp
 *
 * @param tall - Tallen som skal formateres
 * @returns Formatert beløp
 */
export function formaterBeløp(
  tall: number | unknown,
  maximumFractionDigits = 2,
): string {
  if (typeof tall !== "number") {
    return tall as string;
  }

  return tall.toLocaleString("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits,
  });
}

export function konverterTilTall(verdi: unknown): number | null {
  if (verdi === null || verdi === undefined || verdi === "") {
    return null;
  }

  const tall =
    typeof verdi === "number" ? verdi : Number(String(verdi).replace(",", "."));
  return Number.isFinite(tall) ? tall : null;
}

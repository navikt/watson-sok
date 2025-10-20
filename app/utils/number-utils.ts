export function formatterDesimaltall(
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
 * Formatter prosent
 *
 * @param tall - Tallen som skal formatteres som prosent (mellom 0 og 100)
 * @returns Formattert prosent
 */
export function formatterProsent(tall: number | unknown): string {
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
 * Formatter beløp
 *
 * @param tall - Tallen som skal formatteres
 * @returns Formattert beløp
 */
export function formatterBeløp(
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

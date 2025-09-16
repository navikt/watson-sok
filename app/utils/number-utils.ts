export function formatterHeltall(tall: number): string {
  return tall.toLocaleString("nb-NO");
}

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
 * @param tall - Tallen som skal formatteres (mellom 0 og 1)
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

/**
 * Gjør første bokstav stor og resten små
 *
 * @param tekst - Teksten som skal ha stor første bokstav
 * @returns Tekst med stor første bokstav
 */
export function storFørsteBokstav(tekst: string): string {
  if (!tekst) {
    return tekst;
  }

  const førsteBokstav = tekst.charAt(0).toUpperCase();
  const restAvTeksten = tekst.slice(1).toLowerCase();

  return førsteBokstav + restAvTeksten;
}

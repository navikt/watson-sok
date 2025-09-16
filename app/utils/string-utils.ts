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

/**
 * Konverterer camelCase til en norsk setning med stor første bokstav
 *
 * @param camelCaseStr - CamelCase-teksten som skal konverteres
 * @returns Norsk tekst med stor første bokstav
 */
export function camelCaseTilNorsk(camelCaseStr: string | null) {
  if (!camelCaseStr) {
    return "–";
  }

  const ord = camelCaseStr
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(" ");

  // Bytt ut ae, aa og oe med æ, å og ø
  const norskeOrd = ord.map((hvertOrd) =>
    hvertOrd.replace(/oe/g, "ø").replace(/aa/g, "å").replace(/ae/g, "æ"),
  );

  return storFørsteBokstav(norskeOrd.join(" "));
}

/**
 * Gjør første bokstav stor og resten små
 *
 * @param tekst - Teksten som skal ha stor første bokstav
 * @returns Tekst med stor første bokstav
 */
export function storFørsteBokstav(tekst: string | null | undefined): string {
  if (!tekst) {
    return "";
  }

  const førsteBokstav = tekst.charAt(0).toUpperCase();
  const restAvTeksten = tekst.slice(1).toLowerCase();

  return førsteBokstav + restAvTeksten;
}

/**
 * Konverterer camelCase til en norsk setning med stor første bokstav
 *
 * @param camelCaseStr - camelCase-teksten som skal konverteres
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

/**
 * Formaterer fødselsnummer til å ha mellomrom mellom de seks første og de fem siste sifrene
 *
 * @param fødselsnummer - Fødselsnummer som skal formateres
 * @returns Formatert fødselsnummer
 */
export function formatterFødselsnummer(fødselsnummer: string | null): string {
  if (!fødselsnummer || fødselsnummer.length !== 11) {
    return fødselsnummer ?? "";
  }

  return fødselsnummer.slice(0, 6) + " " + fødselsnummer.slice(6);
}

/**
 * Formatterer et tall til en norsk sum
 *
 * @param sum - Summen som skal formateres
 * @returns Formattert sum
 */
export function formatterSum(sum: number | null): string {
  if (!sum) {
    return "–";
  }

  return sum.toLocaleString("nb-NO", {
    style: "currency",
    currency: "NOK",
  });
}

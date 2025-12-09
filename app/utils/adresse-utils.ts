import type { UtenlandskAdresse } from "~/routes/oppslag/schemas";

import type { NorskAdresse } from "~/routes/oppslag/schemas";

import type { Adresse } from "~/routes/oppslag/schemas";
import { storFørsteBokstav, storFørsteBokstavPerOrd } from "./string-utils";

/**
 * Formaterer et adresse-objekt til en norsk adresse eller utenlandsk adresse
 *
 * Om adresse er null, returnerer "–"
 * Om brukeren har både norsk og utenlandsk adresse, returnerer norsk adresse
 *
 * @param adresse - Adresse-objekt som skal formateres
 * @returns Formatert adresse-objekt som en string
 */
export function formaterAdresse(adresse: Adresse | null): string {
  if (adresse?.norskAdresse) {
    return formaterNorskAdresse(adresse.norskAdresse);
  }

  if (adresse?.utenlandskAdresse) {
    return formaterUtenlandskAdresse(adresse.utenlandskAdresse);
  }

  return "–";
}

function formaterNorskAdresse(norskAdresse: NorskAdresse): string {
  const adresselinje1 = `${storFørsteBokstav(norskAdresse.adressenavn)} ${norskAdresse.husnummer}${(norskAdresse.husbokstav ?? "").toUpperCase()}`;
  const adresselinje2 = `${norskAdresse.postnummer} ${storFørsteBokstav(norskAdresse.poststed)}`;
  return `${adresselinje1}, ${adresselinje2}`;
}

function formaterUtenlandskAdresse(
  utenlandskAdresse: UtenlandskAdresse,
): string {
  const adresselinje1 = `${storFørsteBokstav(utenlandskAdresse.adressenavnNummer)} ${utenlandskAdresse.bygningEtasjeLeilighet} ${utenlandskAdresse.postboksNummerNavn}`;
  const adresselinje2 = `${utenlandskAdresse.postkode} ${storFørsteBokstav(utenlandskAdresse.bySted)}, ${utenlandskAdresse.regionDistriktOmråde}`;
  const adresselinje3 = `${storFørsteBokstavPerOrd(utenlandskAdresse.landkode)}`;
  return `${adresselinje1}, ${adresselinje2}, ${adresselinje3}`;
}

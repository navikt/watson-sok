import type { Navn } from "~/routes/oppslag/[ident]/schemas";
import { storFørsteBokstav } from "./string-utils";

/** Tar et navneobjekt og returnerer et fullt navn som en string */
export function tilFulltNavn(navn: Navn | null | undefined) {
  if (!navn) {
    return "Ukjent";
  }
  return [navn.fornavn, navn.mellomnavn, navn.etternavn]
    .filter(Boolean)
    .map(storFørsteBokstav)
    .join(" ");
}

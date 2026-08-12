/** De forskjellige feature-flaggene som kan benyttes */
export enum FeatureFlagg {
  // Søk 1.2 — master-bryter for hele releasen
  RELEASE_1_2 = "watson-sok-v-1-2",

  // Søk 1.3 — master-bryter for releasen (SEARCH-31 næringsinntekt,
  // SEARCH-46 telefon/adressehistorikk, SEARCH-48 eksakte datoer i arbeidsforhold)
  RELEASE_1_3 = "watson-sok-v-1-3",

  STATUSMELDING = "statusmelding",
  CUSTOM_DATO = "custom-dato",
}

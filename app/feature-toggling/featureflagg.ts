/** De forskjellige feature-flaggene som kan benyttes */
export enum FeatureFlagg {
  // Søk 1.2 — master-bryter for hele releasen
  RELEASE_1_2 = "watson-sok-v-1-2",

  // Søk 1.3 — eksakte datoer i arbeidsforhold-tabellen (SEARCH-48)
  RELEASE_1_3 = "watson-sok-v-1-3",

  STATUSMELDING = "statusmelding",
  CUSTOM_DATO = "custom-dato",
}

/** De forskjellige feature-flaggene som kan benyttes */
export enum FeatureFlagg {
  // Søk 1.2 — master-bryter for releasen (SEARCH-28/36 dagpenger meldekort,
  // SEARCH-45 utvidet tidsvindu, SEARCH-46 telefon/adressehistorikk,
  // SEARCH-48 eksakte datoer i arbeidsforhold)
  RELEASE_1_2 = "watson-sok-v-1-2",

  // Søk 1.3 — master-bryter for releasen (SEARCH-31 næringsinntekt)
  RELEASE_1_3 = "watson-sok-v-1-3",

  // SEARCH-30 — AAP-meldekort + AA-timer-sammenligning. Egen bryter,
  // frikoblet fra RELEASE_1_2, fordi funksjonaliteten ikke er klar ennå
  // (viser ikke 14-dagers perioder slik dagpenger-meldekort gjør). Skal stå
  // av inntil funksjonaliteten er ferdigstilt, selv om resten av 1.2 slippes.
  AAP_MELDEKORT = "watson-sok-aap-meldekort",

  STATUSMELDING = "statusmelding",
  CUSTOM_DATO = "custom-dato",
}

/** De forskjellige feature-flaggene som kan benyttes */
export enum FeatureFlagg {
  // Søk 1.2 — master-bryter for hele releasen
  RELEASE_1_2 = "watson-sok-v-1-2",

  // Søk 1.2 — SEARCH-45: Utvide timeline til 13 år
  UTVID_TIMELINE_13_AAR = "utvid-timeline-13-aar",

  // Søk 1.2 — SEARCH-47: Familiemedlemmer vises med navn
  VIS_FAMILIEMEDLEMMER_NAVN = "vis-familiemedlemmer-navn",

  STATUSMELDING = "statusmelding",
  CUSTOM_DATO = "custom-dato",
}

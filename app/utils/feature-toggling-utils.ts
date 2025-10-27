import { initialize } from "unleash-client";
import { env } from "~/config/env.server";

const unleash = initialize({
  url: "https://holmes-unleash-api.nav.cloud.nais.io/api",
  appName: "oppslag-bruker-frontend",
  environment: env.ENVIRONMENT === "prod" ? "production" : "development",
});

/** De forskjellige feature-flaggene som kan benyttes */
type Feature = "inntektsoppsummering-panel";

/** Henter alle påskrudde feature-flaggene */
export function hentAlleFeatureFlagg(): Record<Feature, boolean> {
  return unleash
    .getFeatureToggleDefinitions()
    .reduce(
      (acc, neste) => ({ ...acc, [neste.name]: neste.enabled }),
      {} as Record<Feature, boolean>,
    );
}

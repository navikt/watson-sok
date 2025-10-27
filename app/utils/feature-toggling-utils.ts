import { startUnleash, Unleash } from "unleash-client";
import { env } from "~/config/env.server";

let unleash: Unleash;
export async function initialiserUnleash() {
  unleash = await startUnleash({
    url: `${env.UNLEASH_SERVER_API_URL}/api`,
    appName: "oppslag-bruker-frontend",
    environment: env.ENVIRONMENT === "prod" ? "production" : "development",
    projectName: env.UNLEASH_SERVER_API_PROJECTS,
    customHeaders: {
      Authorization: env.UNLEASH_SERVER_API_TOKEN,
    },
  });
}
/** De forskjellige feature-flaggene som kan benyttes */
export type FeatureFlagg = "inntektsoppsummering-panel";

/** Henter alle påskrudde feature-flaggene */
export async function hentAlleFeatureFlagg(): Promise<
  Record<FeatureFlagg, boolean>
> {
  if (!unleash) {
    await initialiserUnleash();
  }
  return unleash
    .getFeatureToggleDefinitions()
    .reduce(
      (acc, neste) => ({ ...acc, [neste.name]: neste.enabled }),
      {} as Record<FeatureFlagg, boolean>,
    );
}

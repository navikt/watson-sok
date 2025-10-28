import { startUnleash, Unleash } from "unleash-client";
import { env, isDev } from "~/config/env.server";

let unleash: Unleash;
/** Initialiserer Unleash-singletonen */
async function initialiserUnleash() {
  if (unleash) {
    return;
  }
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
export enum FeatureFlagg {
  INNTEKTSOPPSUMMERING_PANEL = "inntektsoppsummering-panel",
}

/** Henter alle påskrudde feature-flaggene */
export async function hentAlleFeatureFlagg(
  navIdent: string,
): Promise<Record<FeatureFlagg, boolean>> {
  if (isDev) {
    return Promise.resolve({
      [FeatureFlagg.INNTEKTSOPPSUMMERING_PANEL]: true,
    });
  }
  await initialiserUnleash();
  return unleash.getFeatureToggleDefinitions().reduce(
    (acc, neste) => {
      acc[neste.name as FeatureFlagg] = unleash.isEnabled(neste.name, {
        usedId: navIdent,
      });
      return acc;
    },
    {} as Record<FeatureFlagg, boolean>,
  );
}

import { startUnleash, Unleash } from "unleash-client";
import { env, isProd } from "~/config/env.server";
import { FeatureFlagg } from "./featureflagg";

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
/** Henter alle påskrudde feature-flaggene */
export async function hentAlleFeatureFlagg(
  navIdent: string,
): Promise<Record<FeatureFlagg, boolean>> {
  if (!isProd) {
    // Hvis vi kjører lokalt eller tester, returnerer vi alle feature flaggene som påskrudd
    return Promise.resolve(
      Object.values(FeatureFlagg).reduce(
        (acc, key) => {
          acc[key as FeatureFlagg] = true;
          return acc;
        },
        {} as Record<FeatureFlagg, boolean>,
      ),
    );
  }
  await initialiserUnleash();
  return unleash.getFeatureToggleDefinitions().reduce(
    (acc, neste) => {
      acc[neste.name as FeatureFlagg] = unleash.isEnabled(neste.name, {
        userId: navIdent,
      });
      return acc;
    },
    {} as Record<FeatureFlagg, boolean>,
  );
}

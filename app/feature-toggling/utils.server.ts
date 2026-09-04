import { startUnleash, type Unleash } from "unleash-client";

import { env } from "~/config/env.server";
import { logger } from "~/logging/logging";

import { FeatureFlagg } from "./featureflagg";

// startUnleash() venter på synkroniseringseventet fra unleash-client uten egen
// timeout. Hvis Unleash-serveren ikke er nåbar av noen grunn, henger kallet for
// alltid — og siden dette kalles fra rootLoader på hver sidevisning, henger da
// hele responsen mens podden fortsatt rapporteres som frisk (health-sjekken
// bruker en annen kodesti). Denne timeouten sikrer at vi i stedet feiler synlig.
const UNLEASH_TIMEOUT_MS = 5000;

function medTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  feilmelding: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tidsavbrudd = setTimeout(
      () => reject(new Error(feilmelding)),
      timeoutMs,
    );
    promise.then(
      (verdi) => {
        clearTimeout(tidsavbrudd);
        resolve(verdi);
      },
      (feil) => {
        clearTimeout(tidsavbrudd);
        reject(feil);
      },
    );
  });
}

let unleash: Unleash;
/** Initialiserer Unleash-singletonen */
async function initialiserUnleash() {
  if (unleash) {
    return;
  }
  if (!env.UNLEASH_SERVER_API_TOKEN) {
    throw new Error("UNLEASH_SERVER_API_TOKEN er ikke satt som miljøvariabel.");
  }
  unleash = await medTimeout(
    startUnleash({
      url: `${env.UNLEASH_SERVER_API_URL}/api`,
      appName: "oppslag-bruker-frontend",
      environment: env.ENVIRONMENT === "prod" ? "production" : "development",
      projectName: env.UNLEASH_SERVER_API_PROJECTS,
      customHeaders: {
        Authorization: env.UNLEASH_SERVER_API_TOKEN,
      },
    }),
    UNLEASH_TIMEOUT_MS,
    `Unleash synkroniserte ikke innen ${UNLEASH_TIMEOUT_MS}ms`,
  );
}

/** Henter alle påskrudde feature-flaggene */
export async function hentAlleFeatureFlagg(
  navIdent: string,
): Promise<Record<FeatureFlagg, boolean>> {
  if (env.ENVIRONMENT.startsWith("local")) {
    logger.info("Returnerer alle feature flaggene som påskrudd");
    // Lokale miljøer får alle feature-flagg påskrudd for enkel utvikling
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
  const toggles = unleash.getFeatureToggleDefinitions();
  return toggles
    .filter((toggle) => toggle.name !== FeatureFlagg.STATUSMELDING)
    .reduce(
      (acc, toggle) => {
        acc[toggle.name as FeatureFlagg] = unleash.isEnabled(toggle.name, {
          userId: navIdent,
        });
        return acc;
      },
      {} as Record<FeatureFlagg, boolean>,
    );
}

type Statusmelding = {
  tittel: string;
  beskrivelse?: string;
};
export async function hentStatusmeldingFeatureFlagg(): Promise<
  Statusmelding | false
> {
  if (env.ENVIRONMENT.startsWith("local")) {
    return false;
  }
  await initialiserUnleash();
  const erPåskrudd = unleash.isEnabled(FeatureFlagg.STATUSMELDING);
  if (!erPåskrudd) {
    return false;
  }

  const tekst = unleash.getFeatureToggleDefinition(
    FeatureFlagg.STATUSMELDING,
  )?.description;

  if (!tekst?.trim()) {
    return false;
  }

  const [tittel, ...beskrivelse] = tekst
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!tittel) {
    return false;
  }

  return {
    tittel,
    beskrivelse: beskrivelse.join("\n") || undefined,
  };
}

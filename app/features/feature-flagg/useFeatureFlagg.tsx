import { unstable_useRoute } from "react-router";
import type { FeatureFlagg } from "~/utils/feature-toggling-utils";

/**
 * Henter alle påskrudde feature-flagg
 */
function useAlleFeatureFlagg(): Record<FeatureFlagg, boolean> {
  const { loaderData } = unstable_useRoute("root");
  if (!loaderData?.featureFlagg) {
    return {} as Record<FeatureFlagg, boolean>;
  }
  return loaderData.featureFlagg;
}

/** Returnerer om ett gitt feature flagg er påskrudd */
export function useEnkeltFeatureFlagg(feature: FeatureFlagg): boolean {
  const featureFlagg = useAlleFeatureFlagg();
  return featureFlagg[feature];
}

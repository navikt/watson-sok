import {
  createReactRouterV6DataOptions,
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration,
  type Faro,
} from "@grafana/faro-react";
import { useEffect } from "react";
import { matchRoutes, unstable_useRoute } from "react-router";

export function useFaro() {
  const { loaderData } = unstable_useRoute("root");
  const isProd = loaderData?.envs.isProd;
  const faroUrl = loaderData?.envs.faroUrl;
  useEffect(() => {
    if (isProd && faroUrl) {
      initFaro(faroUrl);
    }
  }, [isProd, faroUrl]);
}

let faro: Faro | null = null;

function initFaro(url: string) {
  if (typeof document === "undefined" || faro !== null) {
    return;
  }

  faro = initializeFaro({
    url,
    app: {
      name: "oppslag-bruker-frontend",
    },
    sessionTracking: {
      enabled: true,
      persistent: true,
    },
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: true,
        captureConsoleDisabledLevels: [],
      }),
      new ReactIntegration({
        router: createReactRouterV6DataOptions({
          matchRoutes,
        }),
      }),
    ],
  });
}

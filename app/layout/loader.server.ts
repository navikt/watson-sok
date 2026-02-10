import type { LoaderFunctionArgs } from "react-router";
import { hentInnloggetBruker } from "~/auth/innlogget-bruker.server";
import { env, isProd } from "~/config/env.server";
import {
  hentAlleFeatureFlagg,
  hentStatusmeldingFeatureFlagg,
} from "~/feature-toggling/utils.server";
import {
  parsePreferanser,
  preferanserCookie,
} from "~/preferanser/PreferanserCookie";

export async function rootLoader({ request }: LoaderFunctionArgs) {
  const user = await hentInnloggetBruker({ request });
  const [featureFlagg, statusmelding, cookieValue] = await Promise.all([
    hentAlleFeatureFlagg(user.navIdent),
    hentStatusmeldingFeatureFlagg(),
    preferanserCookie.parse(request.headers.get("Cookie")),
  ]);
  const initialPreferanser = parsePreferanser(cookieValue);
  return {
    user,
    initialPreferanser,
    envs: {
      isProd,
      faroUrl: env.FARO_URL,
      umamiSiteId: env.UMAMI_SITE_ID,
      modiaUrl: env.MODIA_URL,
      appversjon: env.APP_VERSION,
      miljø: env.ENVIRONMENT,
    },
    featureFlagg,
    statusmelding,
  };
}

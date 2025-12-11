import type { LoaderFunctionArgs } from "react-router";
import { getLoggedInUser } from "~/features/auth/access-token";
import { env, isProd } from "~/features/config/env.server";
import {
  hentAlleFeatureFlagg,
  hentStatusmeldingFeatureFlagg,
} from "~/features/feature-toggling/utils.server";
import { parseTheme, themeCookie } from "~/features/tema/ThemeCookie";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getLoggedInUser({ request });
  const [featureFlagg, statusmelding, cookieValue] = await Promise.all([
    hentAlleFeatureFlagg(user.navIdent),
    hentStatusmeldingFeatureFlagg(),
    themeCookie.parse(request.headers.get("Cookie")),
  ]);
  const initialTheme = parseTheme(cookieValue);
  return {
    user,
    initialTheme,
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

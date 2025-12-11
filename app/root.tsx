import { FaroErrorBoundary } from "@grafana/faro-react";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import "~/globals.css";
import { getLoggedInUser } from "~/utils/access-token";
import type { Route } from "./+types/root";
import { env, isProd } from "./config/env.server";
import { AnalyticsTags } from "./features/analytics/analytics";
import {
  hentAlleFeatureFlagg,
  hentStatusmeldingFeatureFlagg,
} from "./features/feature-toggling/utils.server";
import { InternalServerError } from "./features/feilhåndtering/InternalServerError";
import { PageNotFound } from "./features/feilhåndtering/PageNotFound";
import { logger } from "./features/logging/logging";
import { genererSikkerhetsheaders } from "./features/sikkerhet/headers";
import { ThemeProvider } from "./features/tema/ThemeContext";
import {
  parseTheme,
  themeCookie,
  type Theme,
} from "./features/tema/ThemeCookie";
import { Versjonsvarsling } from "./features/versjonsvarsling/Versjonsvarsling";
import { initFaro } from "./utils/observability";

export default function Root() {
  const { envs, initialTheme } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (envs.isProd) {
      initFaro(envs.faroUrl);
    }
  }, [envs.isProd, envs.faroUrl]);
  return (
    <HtmlRamme initialTheme={initialTheme} umamiSiteId={envs.umamiSiteId}>
      <Versjonsvarsling gjeldendeVersjon={envs.appversjon} />
      <Outlet />
    </HtmlRamme>
  );
}

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

export const headers = genererSikkerhetsheaders;

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  logger.error("Feil fanget av error boundary", { error });
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <HtmlRamme umamiSiteId="">
        <PageNotFound />
      </HtmlRamme>
    );
  }
  return (
    <HtmlRamme umamiSiteId="">
      <InternalServerError />
    </HtmlRamme>
  );
}

type HtmlRammeProps = {
  children: React.ReactNode;
  initialTheme?: Theme;
  umamiSiteId: string;
};
function HtmlRamme({
  children,
  initialTheme = "light",
  umamiSiteId,
}: HtmlRammeProps) {
  return (
    <html lang="nb-no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <Meta />
        <Links />
        {umamiSiteId && <AnalyticsTags sporingId={umamiSiteId} />}
      </head>
      <body className="flex flex-col min-h-screen">
        <FaroErrorBoundary>
          <ThemeProvider defaultTheme={initialTheme}>{children}</ThemeProvider>
        </FaroErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

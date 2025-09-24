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
import { ThemeProvider } from "./features/darkside/ThemeContext";
import {
  parseTheme,
  themeCookie,
  type Theme,
} from "./features/darkside/ThemeCookie";
import { InternalServerError } from "./features/feilhåndtering/InternalServerError";
import { PageNotFound } from "./features/feilhåndtering/PageNotFound";
import { initFaro } from "./utils/observability";

export default function Root() {
  const { envs, initialTheme } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (envs.isProd) {
      initFaro(envs.faroUrl);
    }
  }, [envs.isProd, envs.faroUrl]);
  return (
    <HtmlRamme initialTheme={initialTheme}>
      <Outlet />
    </HtmlRamme>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getLoggedInUser({ request });
  const cookieValue = await themeCookie.parse(request.headers.get("Cookie"));
  const initialTheme = parseTheme(cookieValue);
  return {
    user,
    initialTheme,
    envs: { isProd, faroUrl: env.FARO_URL, umamiSiteId: env.UMAMI_SITE_ID },
  };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <HtmlRamme>
        <PageNotFound />
      </HtmlRamme>
    );
  }
  return (
    <HtmlRamme>
      <InternalServerError />
    </HtmlRamme>
  );
}

type HtmlRammeProps = {
  children: React.ReactNode;
  initialTheme?: Theme;
};
function HtmlRamme({ children, initialTheme = "light" }: HtmlRammeProps) {
  return (
    <html lang="nb-no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
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

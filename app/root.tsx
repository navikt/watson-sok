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
import { AnalyticsTag } from "./utils/analytics";
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
    envs: {
      isProd,
      faroUrl: env.FARO_URL,
      umamiSiteId: env.UMAMI_SITE_ID,
      modiaUrl: env.MODIA_URL,
    },
  };
}

export function headers() {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "Content-Security-Policy":
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: cdn.nav.no; " +
      `connect-src 'self' telemetry.nav.no telemetry.ekstern.dev.nav.no; ` +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
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
        <Meta />
        <Links />
        {umamiSiteId && <AnalyticsTag sporingId={umamiSiteId} />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
      for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
      e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);
      mixpanel.init('f5e4c5b5414a87e94d8d4182e4c458c2', {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: 'https://api-eu.mixpanel.com'
      });
    `,
          }}
        />

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

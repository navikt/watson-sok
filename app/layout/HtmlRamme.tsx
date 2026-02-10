import { FaroErrorBoundary } from "@grafana/faro-react";
import { Links, Meta, Scripts, ScrollRestoration } from "react-router";
import { AnalyticsTags } from "~/analytics/analytics";
import { PreferanserProvider } from "~/preferanser/PreferanserContext";
import {
  type Preferanser,
  defaultPreferanser,
} from "~/preferanser/PreferanserCookie";

type HtmlRammeProps = {
  children: React.ReactNode;
  initialPreferanser?: Preferanser;
  umamiSiteId: string;
};
export function HtmlRamme({
  children,
  initialPreferanser = defaultPreferanser,
  umamiSiteId,
}: HtmlRammeProps) {
  return (
    <html lang="nb-no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
        {umamiSiteId && <AnalyticsTags sporingId={umamiSiteId} />}
      </head>
      <body className="flex flex-col min-h-screen">
        <FaroErrorBoundary>
          <PreferanserProvider defaultPreferanser={initialPreferanser}>
            {children}
          </PreferanserProvider>
        </FaroErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

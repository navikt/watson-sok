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
  sporingHostUrl?: string;
  umamiSiteId: string;
};
export function HtmlRamme({
  children,
  initialPreferanser = defaultPreferanser,
  sporingHostUrl,
  umamiSiteId,
}: HtmlRammeProps) {
  return (
    <html lang="nb-NO">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
        {umamiSiteId && (
          <AnalyticsTags hostUrl={sporingHostUrl} sporingId={umamiSiteId} />
        )}
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

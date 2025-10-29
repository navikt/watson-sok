import mixpanel from "mixpanel-browser";
import { useEffect } from "react";
import { useUser } from "~/features/auth/useUser";
type AnalyticsTagProps = {
  sporingId: string;
};

export function AnalyticsTags({ sporingId }: AnalyticsTagProps) {
  const { navIdent } = useUser();
  useEffect(() => {
    mixpanel.init("f5e4c5b5414a87e94d8d4182e4c458c2", {
      autocapture: true,
      track_pageview: true,
      record_sessions_percent: 100,
      api_host: "https://api-eu.mixpanel.com",
    });
    if (navIdent) {
      mixpanel.identify(navIdent);
    }
  }, [navIdent]);
  return (
    <script
      defer
      src="https://cdn.nav.no/team-researchops/sporing/sporing.js"
      data-host-url="https://umami.nav.no"
      data-website-id={sporingId}
    />
  );
}

/** Spor en hendelse til analyseformål
 *
 * Du kan sende med et objekt med relevante data for hendelsen.
 */
export function sporHendelse(
  hendelse: Hendelse,
  data: Record<string, unknown> = {},
) {
  if (process.env.NODE_ENV === "development") {
    console.info(`📊 [Analytics] ${hendelse}`, data);
    return;
  }
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(hendelse, data);
  }
  mixpanel.track(hendelse, data);
}

type Hendelse =
  | "søk landingsside"
  | "lenke trykket brønnøysundregistrene"
  | "handlinger for arbeidsforhold åpnet"
  | "organisasjonsnummer kopiert"
  | "organisasjonsnummer-kopiering feilet"
  | "tidslinje periode flyttet"
  | "tidslinje størrelse endret";

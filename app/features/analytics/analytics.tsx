import mixpanel from "mixpanel-browser";
import { useEffect } from "react";
import { useUser } from "~/features/auth/useUser";
import { useMiljø } from "~/features/use-miljø/useMiljø";
import { logger } from "~/utils/logging";
type AnalyticsTagProps = {
  sporingId: string;
};

export function AnalyticsTags({ sporingId }: AnalyticsTagProps) {
  const { navIdent } = useUser();
  const miljø = useMiljø();
  useEffect(() => {
    if (miljø !== "prod") {
      return;
    }
    mixpanel.init("f5e4c5b5414a87e94d8d4182e4c458c2", {
      autocapture: true,
      track_pageview: true,
      record_sessions_percent: 100,
      api_host: "https://api-eu.mixpanel.com",
    });
    if (navIdent) {
      mixpanel.identify(navIdent);
    }
  }, [navIdent, miljø]);
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
    if (hendelse.length > 50) {
      logger.warn(
        `📊 [Analytics] Hendelse ${hendelse} er for lang. Maks lengde er 50 tegn, hendelsen er på ${hendelse.length} tegn.`,
      );
    }
    logger.info(`📊 [Analytics] ${hendelse}`, data);
    return;
  }
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(hendelse.substring(0, 50), data); // Maks lengde er 50 tegn for Umami
  }
  mixpanel.track(hendelse, data);
}

type Hendelse =
  | "søk landingsside"
  | "søk header"
  | "søk familiemedlem"
  | "lenke trykket brønnøysundregistrene"
  | "handlinger for arbeidsforhold åpnet"
  | "organisasjonsnummer kopiert"
  | "organisasjonsnummer-kopiering feilet"
  | "tidslinje periode flyttet"
  | "tidslinje størrelse endret"
  | "ytelse utbetalinger modal åpnet"
  | "side lastet på nytt grunnet ny versjon"
  | "vis færre arbeidsforhold klikket"
  | "vis alle arbeidsforhold klikket"
  | "skjermingsbegrunnelse utfylt"
  | "skjermingsbegrunnelse avbrutt"
  | "endre tema"
  | "tilbakemelding";

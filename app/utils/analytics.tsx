import mixpanel from "mixpanel-browser";
import { useEffect } from "react";
import { useUser } from "~/features/auth/useUser";
import { useMiljø } from "~/features/use-miljø/useMiljø";

/** Initialiserer alle analytics-tjenester */
export function useAnalytics() {
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
      ignore_dnt: true,
    });
    if (navIdent) {
      mixpanel.identify(navIdent);
    }
  }, [navIdent, miljø]);
}

/** Spor en hendelse til analyseformål
 *
 * Du kan sende med et objekt med relevante data for hendelsen.
 */
export function sporHendelse(
  hendelse: Hendelse,
  data: Record<string, unknown> = {},
) {
  mixpanel.track(hendelse, data);
}

type Hendelse =
  | "søk landingsside"
  | "søk header"
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

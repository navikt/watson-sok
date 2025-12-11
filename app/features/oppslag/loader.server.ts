import { env } from "process";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { hentArbeidsforhold } from "~/features/arbeidsforhold/api.server";
import { RouteConfig } from "~/features/config/routeConfig";
import { hentInntekter } from "~/features/inntekt-og-ytelse/inntekt/api.server";
import { hentYtelser } from "~/features/inntekt-og-ytelse/ytelse/api.server";
import { hentPersonopplysninger } from "~/features/person/api.server";
import { hentSøkedataFraSession } from "~/features/søk/søkeinfoSession.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const søkedata = await hentSøkedataFraSession(request);
  const traceLogging =
    new URL(request.url).searchParams.get("traceLogging") === "true";

  if (
    !søkedata.ident ||
    !søkedata.tilgang ||
    søkedata.tilgang === "IKKE_FUNNET"
  ) {
    return redirect(RouteConfig.INDEX);
  }

  if (
    søkedata.tilgang !== "OK" &&
    !søkedata.bekreftetBegrunnetTilgang &&
    !søkedata.harUtvidetTilgang
  ) {
    return redirect(RouteConfig.TILGANG);
  }

  const params = {
    ident: søkedata.ident,
    request,
    navCallId: crypto.randomUUID(),
    traceLogging,
  };

  const utvidet = new URL(request.url).searchParams.get("utvidet") === "true";
  return {
    miljø: env.ENVIRONMENT,
    erBegrensetTilgang:
      !søkedata.harUtvidetTilgang &&
      [
        "AVVIST_STRENGT_FORTROLIG_ADRESSE",
        "AVVIST_STRENGT_FORTROLIG_UTLAND",
        "AVVIST_FORTROLIG_ADRESSE",
      ].includes(søkedata.tilgang),
    personopplysninger: hentPersonopplysninger(params),
    arbeidsgiverInformasjon: hentArbeidsforhold(params),
    inntektInformasjon: hentInntekter(params),
    ytelser: hentYtelser({
      ...params,
      utvidet,
    }),
  };
}

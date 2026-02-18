import { env } from "process";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { hentArbeidsforhold } from "~/arbeidsforhold/api.server";
import { hentInnloggetBruker } from "~/auth/innlogget-bruker.server";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { hentAlleFeatureFlagg } from "~/feature-toggling/utils.server";
import { hentInntekter } from "~/inntekt-og-ytelse/inntekt/api.server";
import { hentPensjonsgivendeInntekt } from "~/inntekt-og-ytelse/naeringsinntekt/api.server";
import { hentYtelser } from "~/inntekt-og-ytelse/ytelse/api.server";
import { hentPersonopplysninger } from "~/person/api.server";
import { RouteConfig } from "~/routeConfig";
import { hentSøkedataFraSession } from "~/søk/søkeinfoSession.server";

export async function oppslagLoader({ request }: LoaderFunctionArgs) {
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

  const utvidet = new URL(request.url).searchParams.get("utvidet") === "true";

  const params = {
    ident: søkedata.ident,
    request,
    navCallId: crypto.randomUUID(),
    traceLogging,
    utvidet,
  };

  const { navIdent } = await hentInnloggetBruker({ request });
  const featureFlagg = await hentAlleFeatureFlagg(navIdent);

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
    ytelser: hentYtelser(params),
    næringsinntekt: featureFlagg[FeatureFlagg.NAERINGSINNTEKT]
      ? hentPensjonsgivendeInntekt(params)
      : Promise.resolve([]),
  };
}

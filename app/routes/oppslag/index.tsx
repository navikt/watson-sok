import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { Page, PageBlock } from "@navikt/ds-react/Page";
import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { env } from "~/config/env.server";
import { RouteConfig } from "~/config/routeConfig";
import { FeatureFlagg } from "~/features/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/features/feature-toggling/useFeatureFlagg";
import { ArbeidsforholdPanel } from "~/features/paneler/ArbeidsforholdPanel";
import { InntektOgYtelseOverlappPanel } from "~/features/paneler/inntekt-og-ytelse-overlapp-panel";
import { InntektPanel } from "~/features/paneler/InntektPanel";
import { InntektsoppsummeringPanel } from "~/features/paneler/InntektsoppsummeringPanel";
import { YtelserPanel } from "~/features/paneler/YtelserPanel";
import { hentPersonopplysninger } from "~/features/person/api.server";
import { OverskriftPanel } from "~/features/person/OverskriftPanel";
import { PersonopplysningerPanel } from "~/features/person/PersonopplysningerPanel";
import { hentSøkedataFraSession } from "~/features/søk/søkeinfoSession.server";
import {
  TidsvinduProvider,
  TidsvinduVelger,
} from "../../features/tidsvindu/Tidsvindu";
import { hentArbeidsforhold, hentInntekter, hentYtelser } from "./api.server";

export default function OppslagBruker() {
  const data = useLoaderData<typeof loader>();
  const visInntektsoppsummeringPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.INNTEKTSOPPSUMMERING_PANEL,
  );
  const visInntektOgYtelseOverlappPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.INNTEKT_OG_YTELSE_OVERLAPP_PANEL,
  );
  return (
    <TidsvinduProvider>
      <Page>
        <PageBlock className="flex flex-col gap-4 mt-8 px-4">
          <OverskriftPanel promise={data.personopplysninger} />
          <div className="sticky top-4 z-20 self-end -mt-13">
            <TidsvinduVelger />
          </div>
          {data.erBegrensetTilgang && (
            <Alert variant="info" className="w-fit mb-4">
              <Heading level="2" size="small" spacing>
                Begrenset tilgang
              </Heading>
              <BodyShort spacing>
                Du har kun tilgang til å se deler av informasjonen for denne
                brukeren. Det kan være fordi personen er skjermet, bor på
                fortrolig adresse eller andre grunner. Ta kontakt med nærmeste
                leder om du har behov for å se mer informasjon.
              </BodyShort>
            </Alert>
          )}
          <PersonopplysningerPanel promise={data.personopplysninger} />
          <YtelserPanel promise={data.ytelser} />
          {visInntektOgYtelseOverlappPanel ? (
            <div className="grid grid-cols-1 min-[1800px]:grid-cols-2 gap-4">
              <InntektOgYtelseOverlappPanel
                inntektPromise={data.inntektInformasjon}
                ytelserPromise={data.ytelser}
              />
              <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
            </div>
          ) : (
            <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InntektPanel
              promise={data.inntektInformasjon}
              ytelserPromise={data.ytelser}
            />

            {visInntektsoppsummeringPanel && (
              <InntektsoppsummeringPanel promise={data.inntektInformasjon} />
            )}
          </div>
        </PageBlock>
      </Page>
    </TidsvinduProvider>
  );
}

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

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  const miljø = loaderData?.miljø ?? "ukjent";
  return [
    {
      title: `Oppslag – Watson Søk ${miljø !== "prod" ? `(${miljø})` : ""}`,
    },
  ];
}

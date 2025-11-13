import { Alert, BodyShort, Heading, HGrid } from "@navikt/ds-react";
import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { FeatureFlagg } from "~/features/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/features/feature-toggling/useFeatureFlagg";
import { hentSøkedataFraSession } from "~/features/oppslag/oppslagSession.server";
import { ArbeidsforholdPanel } from "~/features/paneler/ArbeidsforholdPanel";
import { BrukerinformasjonPanel } from "~/features/paneler/BrukerinformasjonPanel";
import { InntektPanel } from "~/features/paneler/InntektPanel";
import { InntektsoppsummeringPanel } from "~/features/paneler/InntektsoppsummeringPanel";
import { OverskriftPanel } from "~/features/paneler/OverskriftPanel";
import { YtelserPanel } from "~/features/paneler/YtelserPanel";
import {
  hentArbeidsforhold,
  hentInntekter,
  hentPersonopplysninger,
  hentYtelser,
} from "./api.server";

export default function OppslagBruker() {
  const data = useLoaderData<typeof loader>();
  const visInntektsoppsummeringPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.INNTEKTSOPPSUMMERING_PANEL,
  );

  return (
    <div className="flex flex-col gap-4 px-4 mt-8">
      <div className="mb-4">
        <OverskriftPanel promise={data.personopplysninger} />
      </div>
      {data.erBegrensetTilgang && (
        <Alert variant="info" className="w-fit mb-4">
          <Heading level="2" size="small" spacing>
            Begrenset tilgang
          </Heading>
          <BodyShort spacing>
            Du har kun tilgang til å se deler av informasjonen for denne
            brukeren. Det kan være fordi personen er skjermet, bor på fortrolig
            adresse eller andre grunner. Ta kontakt med nærmeste leder om du har
            behov for å se mer informasjon.
          </BodyShort>
        </Alert>
      )}
      <HGrid gap="space-24" columns={{ xs: 1, md: 2 }}>
        <BrukerinformasjonPanel promise={data.personopplysninger} />
        <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
      </HGrid>

      <YtelserPanel promise={data.ytelser} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InntektPanel
          promise={data.inntektInformasjon}
          ytelserPromise={data.ytelser}
        />

        {visInntektsoppsummeringPanel && (
          <InntektsoppsummeringPanel promise={data.inntektInformasjon} />
        )}
      </div>
    </div>
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

  if (søkedata.tilgang !== "OK" && !søkedata.bekreftetBegrunnetTilgang) {
    return redirect(RouteConfig.BEKREFT_BEGRUNNET_TILGANG);
  }

  const params = {
    ident: søkedata.ident,
    request,
    navCallId: crypto.randomUUID(),
    traceLogging,
  };

  const utvidet = new URL(request.url).searchParams.get("utvidet") === "true";
  return {
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
  if (!loaderData || "error" in loaderData) {
    return [];
  }
  return [
    {
      title: `Oppslag bruker`,
    },
  ];
}

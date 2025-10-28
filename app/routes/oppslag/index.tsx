import { Alert, BodyShort, Button, Heading, HGrid } from "@navikt/ds-react";
import {
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { FeatureFlagg } from "~/features/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/features/feature-toggling/useFeatureFlagg";
import { hentIdentFraSession } from "~/features/oppslag/oppslagSession.server";
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
  sjekkEksistensOgTilgang,
} from "./api.server";

export default function OppslagBruker() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const visInntektsoppsummeringPanel = useEnkeltFeatureFlagg(
    FeatureFlagg.INNTEKTSOPPSUMMERING_PANEL,
  );

  return (
    <div className="flex flex-col gap-4 px-4 mt-8">
      {data.eksistensOgTilgang === "forbidden" ? (
        <Alert variant="warning" className="w-fit">
          Du har ikke tilgang til å se denne personen
        </Alert>
      ) : data.eksistensOgTilgang === "not found" ? (
        <Alert variant="warning" className="w-fit">
          <Heading level="2" size="small">
            Ingen treff på fødsels- eller D-nummer
          </Heading>
          <BodyShort>
            Det finnes ingen bruker med dette fødselsnummeret eller D-nummeret.
            Vennligst prøv igjen med et annet fødselsnummer eller D-nummer.
          </BodyShort>
        </Alert>
      ) : data.eksistensOgTilgang === "error" ? (
        <Alert variant="error" className="w-fit">
          <Heading level="2" size="small" spacing>
            En feil oppstod ved henting av bruker
          </Heading>
          <BodyShort spacing>
            Systemet vårt har litt problemer akkurat nå. Vennligst prøv igjen
            senere.
          </BodyShort>
          <Button onClick={() => navigate(RouteConfig.INDEX)}>
            Gå til forsiden
          </Button>
        </Alert>
      ) : data.eksistensOgTilgang === "ok" ||
        data.eksistensOgTilgang === "partial" ? (
        <>
          <div className="mb-4">
            <OverskriftPanel promise={data.personopplysninger} />
          </div>
          {data.eksistensOgTilgang === "partial" && (
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
        </>
      ) : null}
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const ident = await hentIdentFraSession(request);
  if (!ident) {
    return redirect(RouteConfig.INDEX);
  }

  // Generer en unik nav-call-id for dette oppslaget
  const navCallId = crypto.randomUUID();

  const eksistensOgTilgang = await sjekkEksistensOgTilgang(
    ident,
    request,
    navCallId,
  );
  if (eksistensOgTilgang === "ok" || eksistensOgTilgang === "partial") {
    return {
      eksistensOgTilgang,
      personopplysninger: hentPersonopplysninger(ident, request, navCallId),
      arbeidsgiverInformasjon: hentArbeidsforhold(ident, request, navCallId),
      inntektInformasjon: hentInntekter(ident, request, navCallId),
      ytelser: hentYtelser(ident, request, navCallId),
    };
  }
  return {
    eksistensOgTilgang,
  };
}

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  if (!loaderData || "error" in loaderData) {
    return [];
  }
  return [
    {
      title: `Oppslag Bruker`,
    },
  ];
}

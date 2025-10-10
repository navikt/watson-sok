import { Alert, BodyShort, Button, Heading, HGrid } from "@navikt/ds-react";
import {
  redirect,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { hentIdentFraSession } from "~/features/oppslag/oppslagSession.server";
import { ArbeidsforholdPanel } from "~/features/paneler/ArbeidsforholdPanel";
import { BrukerinformasjonPanel } from "~/features/paneler/BrukerinformasjonPanel";
import { InntektPanel } from "~/features/paneler/InntektPanel";
import { OverskriftPanel } from "~/features/paneler/OverskriftPanel";
import { StønaderPanel } from "~/features/paneler/StønaderPanel";
import {
  hentArbeidsforhold,
  hentInntekter,
  hentPersonopplysninger,
  hentStønader,
  sjekkEksistensOgTilgang,
} from "./api.server";

export default function OppslagBruker() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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
          En feil oppstod ved henting av bruker
          <Button onClick={() => navigate(RouteConfig.INDEX)}>
            Gå til forsiden
          </Button>
        </Alert>
      ) : data.eksistensOgTilgang === "ok" ? (
        <>
          <div className="mb-4">
            <OverskriftPanel promise={data.personopplysninger} />
          </div>
          <HGrid gap="space-24" columns={{ xs: 1, sm: 2, md: 2 }}>
            <BrukerinformasjonPanel promise={data.personopplysninger} />
            <ArbeidsforholdPanel promise={data.arbeidsgiverInformasjon} />
          </HGrid>

          <StønaderPanel promise={data.stønader} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InntektPanel promise={data.inntektInformasjon} />
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

  const eksistensOgTilgang = await sjekkEksistensOgTilgang(ident, request);
  if (eksistensOgTilgang === "ok") {
    return {
      eksistensOgTilgang,
      personopplysninger: hentPersonopplysninger(ident, request),
      arbeidsgiverInformasjon: hentArbeidsforhold(ident, request),
      inntektInformasjon: hentInntekter(ident, request),
      stønader: hentStønader(ident, request),
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

import { Alert, Heading, HGrid } from "@navikt/ds-react";
import {
  data,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaArgs,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { hentIdentFraSession } from "~/features/oppslag/oppslagSession.server";
import { ArbeidsforholdPanel } from "~/features/paneler/ArbeidsforholdPanel";
import { BrukerinformasjonPanel } from "~/features/paneler/BrukerinformasjonPanel";
import { InntektPanel } from "~/features/paneler/InntektPanel";
import { StønaderPanel } from "~/features/paneler/StønaderPanel";
import { tilFulltNavn } from "~/utils/navn-utils";
import { fetchIdent } from "./fetchIdent.server";

export default function OppslagBruker() {
  const data = useLoaderData<typeof loader>();

  if ("error" in data) {
    return (
      <>
        <title>Feil – Oppslag Bruker</title>
        <Alert variant="error">{data.error}</Alert>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <Heading level="1" size="large" spacing className="mt-8">
        Brukeroppslag på {tilFulltNavn(data.personInformasjon?.navn)} (
        {data.personInformasjon?.alder})
      </Heading>
      <HGrid gap="space-24" columns={{ xs: 1, sm: 2, md: 2 }}>
        {data.personInformasjon && (
          <BrukerinformasjonPanel personInformasjon={data.personInformasjon} />
        )}
        {data.arbeidsgiverInformasjon && (
          <ArbeidsforholdPanel
            arbeidsgiverInformasjon={data.arbeidsgiverInformasjon}
          />
        )}
      </HGrid>
      {data.stønader && <StønaderPanel stønader={data.stønader} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.inntektInformasjon && (
          <InntektPanel inntektInformasjon={data.inntektInformasjon} />
        )}
      </div>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const ident = await hentIdentFraSession(request);
  if (!ident) {
    return redirect(RouteConfig.INDEX);
  }

  const response = await fetchIdent({ ident, request });
  if ("error" in response) {
    return data({ error: response.error }, { status: response.status });
  }
  return data(response);
}

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  if (!loaderData || "error" in loaderData) {
    return [];
  }
  return [
    {
      title: `${tilFulltNavn(loaderData.personInformasjon?.navn)} (${loaderData.personInformasjon?.alder}) – Oppslag Bruker`,
    },
  ];
}

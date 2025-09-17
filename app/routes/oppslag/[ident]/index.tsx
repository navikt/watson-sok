import { Alert, Button, Heading, HGrid } from "@navikt/ds-react";
import {
  data,
  useLoaderData,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import DetaljModal from "~/components/DetaljModal";
import { ArbeidsforholdPanel } from "~/components/paneler/ArbeidsforholdPanel";
import { BrukerinformasjonPanel } from "~/components/paneler/BrukerinformasjonPanel";
import { InntektPanel } from "~/components/paneler/InntektPanel";
import StonadOversikt from "~/components/StonadOversikt";
import { tilFulltNavn } from "~/utils/navn-utils";
import { useDisclosure } from "~/utils/useDisclosure";
import { fetchIdent } from "./fetchIdent.server";

export default function OppslagBruker() {
  const { ident } = useParams();
  const data = useLoaderData<typeof loader>();

  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!ident) {
    return (
      <Alert variant="error">
        Fant ingen ident i URLen. Sjekk at URLen er korrekt formattert.
      </Alert>
    );
  }

  if ("error" in data) {
    return <Alert variant="error">{data.error}</Alert>;
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <Heading level="1" size="large" spacing className="mt-8">
        Brukeroppslag på {tilFulltNavn(data.personInformasjon?.navn)}
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
      {data.stønader && <StonadOversikt stønader={data.stønader} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.inntektInformasjon && (
          <InntektPanel inntektInformasjon={data.inntektInformasjon} />
        )}
      </div>

      <div>
        <Button onClick={onOpen}>Hent familieforhold</Button>
      </div>

      {isOpen && <DetaljModal fnr={ident} onClose={onClose} />}
    </div>
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!params.ident) {
    throw new Error(
      "Fant ingen ident i URLen. Sjekk at URLen er korrekt formattert.",
    );
  }
  const response = await fetchIdent({ ident: params.ident, request });
  if ("error" in response) {
    return data({ error: response.error }, { status: response.status });
  }
  return response;
}

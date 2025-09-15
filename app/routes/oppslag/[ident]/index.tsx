import { Alert, Button, HGrid } from "@navikt/ds-react";
import {
  data,
  useLoaderData,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import { ArbeidsforholdDetaljer } from "~/components/ArbeidsforholdDetaljer";
import DetaljModal from "~/components/DetaljModal";
import InntektTabellOversikt from "~/components/InntektTabellOversikt";
import PersonDetaljer from "~/components/PersonDetaljer";
import StonadOversikt from "~/components/StonadOversikt";
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
    <div>
      <HGrid gap="space-24" columns={{ xs: 1, sm: 2, md: 2 }}>
        <div>
          {data.personInformasjon && (
            <PersonDetaljer personInformasjon={data.personInformasjon} />
          )}
        </div>
        <div>
          <div>
            {data.arbeidsgiverInformasjon && (
              <ArbeidsforholdDetaljer
                arbeidsgiverInformasjon={data.arbeidsgiverInformasjon}
              />
            )}
          </div>
        </div>
      </HGrid>
      <div>
        {data.stonadOversikt && (
          <StonadOversikt stonadOversikt={data.stonadOversikt} />
        )}
      </div>
      <div>
        {data.inntektInformasjon && (
          <InntektTabellOversikt inntektInformasjon={data.inntektInformasjon} />
        )}
      </div>

      <div className="mt-4">
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

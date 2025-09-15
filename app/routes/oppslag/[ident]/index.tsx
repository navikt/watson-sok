import { Alert, Button, HGrid } from "@navikt/ds-react";
import { useState } from "react";
import {
  data,
  useLoaderData,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import ArbedsDetaljer from "~/components/ArbedsDetaljer";
import DetaljModal from "~/components/DetaljModal";
import InntektTabellOversikt from "~/components/InntektTabellOversikt";
import PersonDetaljer from "~/components/PersonDetaljer";
import StonadOversikt from "~/components/StonadOversikt";
import { fetchIdent } from "./fetchIdent.server";

export default function OppslagBruker() {
  const { ident } = useParams();
  const data = useLoaderData<typeof loader>();

  const [modalOpen, setModalOpen] = useState(false); // 👈 modal state

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
          {data?.personInformasjon && (
            <PersonDetaljer personInformasjon={data.personInformasjon} />
          )}
        </div>
        <div>
          <div>
            {data?.arbeidsgiverInformasjon && (
              <ArbedsDetaljer
                arbeidsgiverInformasjon={data.arbeidsgiverInformasjon}
              />
            )}
          </div>
        </div>
      </HGrid>
      <div>
        {data?.stonadOversikt && (
          <StonadOversikt stonadOversikt={data.stonadOversikt} />
        )}
      </div>
      <div>
        {data?.inntektInformasjon && (
          <InntektTabellOversikt inntektInformasjon={data.inntektInformasjon} />
        )}
      </div>

      <div className="mt-4">
        <Button onClick={() => setModalOpen(true)}>Hent Familie Forhold</Button>
      </div>

      {modalOpen && (
        <DetaljModal fnr={ident} onClose={() => setModalOpen(false)} />
      )}
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

import { Alert, Button, HGrid } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ArbedsDetaljer from "~/components/ArbedsDetaljer";
import DetaljModal from "~/components/DetaljModal";
import InntektTabellOversikt from "~/components/InntektTabellOversikt";
import PersonDetaljer from "~/components/PersonDetaljer";
import StonadOversikt from "~/components/StonadOversikt";
import type { OppslagBrukerRespons } from "~/types/Domain";

export default function OppslagBruker() {
  const { ident } = useParams();
  const [data, setData] = useState<OppslagBrukerRespons | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false); // 👈 modal state

  useEffect(() => {
    if (!ident) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/oppslag?fnr=${ident}`);
        if (!res.ok) throw new Error("Feil ved henting av data");
        const json: OppslagBrukerRespons = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ukjent feil");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ident]);

  if (!ident) {
    return <Alert variant="warning">Ingen fødselsnummer valgt.</Alert>;
  }
  if (loading) {
    return <p>Laster data...</p>;
  }
  if (error) {
    return <Alert variant="error">{error}</Alert>;
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

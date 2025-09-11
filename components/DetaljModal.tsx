"use client";

import { Modal } from "@navikt/ds-react";
import { useEffect, useState } from "react";

export default function DetaljModal({
  fnr,
  onClose,
}: {
  fnr: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<never | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/oppslag/detaljer?fnr=${fnr}`);
        if (!res.ok) throw new Error("Kunne ikke hente detaljer");
        const json = await res.json();
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

    fetchDetails();
  }, [fnr]);

  return (
    <Modal open onClose={onClose} header={{ heading: "Detaljer for bruker" }}>
      <div className="p-6">
        {loading && <p>Laster detaljer...</p>}
        {error && <p>Feil: {error}</p>}
        {data && (
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </Modal>
  );
}

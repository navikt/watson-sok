"use client";

import { useEffect, useState } from "react";
import { useUserSearch } from "@/app/context/UserSearchContext";
import { Alert, Heading, Button } from "@navikt/ds-react";
import DetaljModal from "@/app/components/DetaljModal";
import {OppslagResponse} from "@/app/types/user";

export default function OppslagBruker() {
    const { fnr } = useUserSearch();
    const [data, setData] = useState<OppslagResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false); // 👈 modal state

    useEffect(() => {
        if (!fnr) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/oppslag?fnr=${fnr}`);
                if (!res.ok) throw new Error("Feil ved henting av data");
                const json = await res.json();
                setData(json);
            }  catch (err: unknown) {
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
    }, [fnr]);

    if (!fnr) return <Alert variant="warning">Ingen fødselsnummer valgt.</Alert>;
    if (loading) return <p>Laster data...</p>;
    if (error) return <Alert variant="error">{error}</Alert>;

    return (
        <div className="p-4 mt-4">
            <Heading size="small">Resultat fra tjeneste</Heading>
            <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>

            <div className="mt-4">
                <Button onClick={() => setModalOpen(true)}>Hent Familie Forhold</Button>
            </div>

            {modalOpen && (
                <DetaljModal fnr={fnr} onClose={() => setModalOpen(false)} />
            )}
        </div>
    );
}

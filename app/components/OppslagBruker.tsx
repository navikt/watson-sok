"use client";
import { FileIcon } from '@navikt/aksel-icons';
import { useEffect, useState } from "react";
import { useUserSearch } from "@/app/context/UserSearchContext";
import {Alert, Button, HGrid, Box, Heading, HStack} from "@navikt/ds-react";
import DetaljModal from "@/app/components/DetaljModal";
import {OppslagBrukerRespons} from "@/app/types/Domain";
import PersonDetaljer from "@/app/components/PersonDetaljer";

import StonadOversikt from "@/app/components/StonadOversikt";
import ArbeidsDetaljer from "@/app/components/ArbedsDetaljer";
import InntektTabellOversikt from "@/app/components/InntektTabellOversikt";


export default function OppslagBruker() {
    const { fnr } = useUserSearch();
    const [data, setData] = useState<OppslagBrukerRespons | null>(null);
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
                const json: OppslagBrukerRespons = await res.json();
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
    const alder = getAlderFraFnr(fnr)
    return (
        <div className="p-4 mt-4">
            <HStack gap="2" align="center" >
            <FileIcon title="a11y-title" fontSize="2.5rem" />
            {data?.personInformasjon && (
                <Heading level="1" size="large" spacing>
                    Oppslag på bruker {data.personInformasjon.navn_.fornavn} {data.personInformasjon.navn_.mellomnavn} {data.personInformasjon.navn_.etternavn} ({alder})
                </Heading>
            )}
            </HStack>

            <Box>
                <HGrid gap="space-24" columns={{ xs: 1, sm: 2, md: 2 }}>
                    <div>
                        {data?.personInformasjon && (
                            <PersonDetaljer personInformasjon={data.personInformasjon} />
                        )}
                    </div>
                    <div>
                        <div>
                            {data?.arbeidsgiverInformasjon && (
                                <ArbeidsDetaljer arbeidsgiverInformasjon={data.arbeidsgiverInformasjon} />
                            )}
                        </div>
                    </div>
                </HGrid>
            </Box>
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
                <DetaljModal fnr={fnr} onClose={() => setModalOpen(false)} />
            )}
        </div>
    );
}
export function getAlderFraFnr(fnr: string): number | null {
    if (!fnr || fnr.length !== 11) return null;

    // FNR og DNR har DDMMYY i starten
    let dag = parseInt(fnr.slice(0, 2), 10);
    const måned = parseInt(fnr.slice(2, 4), 10);
    const år = parseInt(fnr.slice(4, 6), 10);

    // Juster for D-nummer (dag + 40)
    if (dag >= 41 && dag <= 71) {
        dag -= 40;
    }

    // Gjett århundre
    const fødselsår = år >= 0 && år <= new Date().getFullYear() % 100
        ? 2000 + år
        : 1900 + år;

    const fødselsdato = new Date(fødselsår, måned - 1, dag);
    const nå = new Date();

    let alder = nå.getFullYear() - fødselsdato.getFullYear();
    const harIkkeHattBursdag = (
        nå.getMonth() < fødselsdato.getMonth() ||
        (nå.getMonth() === fødselsdato.getMonth() && nå.getDate() < fødselsdato.getDate())
    );

    if (harIkkeHattBursdag) {
        alder -= 1;
    }
    console.log(alder)
    return alder;
}
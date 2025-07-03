"use client";

import React from "react";
import {
    Alert,
    VStack,
    Search,
    Bleed,
    Heading,
    Page,
    Stack,
} from "@navikt/ds-react";
import { FileIcon } from "@navikt/aksel-icons";

import { useUserSearch } from "@/app/context/UserSearchContext";
import { useFeature } from "@/app/context/FeatureContext";

export default function Info() {
    const { setFnr } = useUserSearch();
    const { setValgtFeature } = useFeature();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fnr = formData.get("fnr")?.toString().trim();
        if (fnr && fnr.length === 11) {
            setFnr(fnr);
            setValgtFeature("oppslag-bruker");
        } else {
            alert("Ugyldig fødselsnummer");
        }
    };

    return (
        <Page>
            <Page.Block width="text" gutters>
                <VStack as="main" gap="8">
                    <Bleed marginInline={{ lg: "24" }} data-aksel-template="form-intropage-v2">
                        <Stack
                            gap="6"
                            direction={{ sm: "row-reverse", lg: "row" }}
                            justify={{ sm: "space-between", lg: "start" }}
                            wrap={false}
                        >
                            <VStack gap="1">
                                <Heading level="1" size="medium" align={"start"}>
                                    <FileIcon title="a11y-title" fontSize="1.0rem" />
                                    Oppslag på bruker i Nav
                                </Heading>
                                <p>
                                    Ved å søke på fødselsnummer eller D-nummer i søkefeltet nedenfor får du
                                    en enkel oversikt over en Nav bruker sine forhold i Nav
                                </p>
                                <Alert variant="info" closeButton={true}>
                                    Melding til saksbehandler. En informasjon om at man ikke må bruke tjenesten dersom det ikke ligger tjenstlig behov til grunn. Her kan det også oppgis hvilke lover og paragrafer som gjelder.
                                </Alert>

                                <form className="self-center px-5" onSubmit={handleSubmit}>
                                    <VStack>
                                        <label htmlFor="fnr">Fødselsnummer/D-nummer</label>
                                        <Search
                                            name="fnr"
                                            size="medium"
                                            variant="primary"
                                            placeholder="11 siffer"
                                            label="Søk på fødselsnummer"
                                        />
                                    </VStack>
                                </form>
                            </VStack>
                        </Stack>
                    </Bleed>
                </VStack>
            </Page.Block>
        </Page>
    );
}

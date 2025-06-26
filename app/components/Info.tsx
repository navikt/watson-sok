
"use client";


import React  from "react";
import { Alert, AlertProps, VStack } from "@navikt/ds-react";
import { FileIcon } from '@navikt/aksel-icons';
import {
    Bleed,
    Heading,
    Page,
    Stack,
} from "@navikt/ds-react";

export default function Info() {
    return  (
        <div>
        <Page>
            <Page.Block width="text" gutters>
                <VStack as="main" gap="8">
                    <Bleed
                        marginInline={{ lg: "24" }}
                        data-aksel-template="form-intropage-v2"
                    >
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
                                <p>Ved å søke på fødselsnummer eller D-nummer i søkefeltet nedenfor får du en enkel oversikt over en Nav bruker sine forhold i Nav</p>
                                <Alert variant="info" closeButton={true}>
                                    Melding til saksbehandler . En informasjon om at man ikke må bruke tjenesten dersom det ikke ligger tjenestelig behov til grunn. Her kan det også oppgis hvilke lover og referanse til hvilke paragrafer som gjelder.
                                </Alert>
                            </VStack>
                        </Stack>
                    </Bleed>
                </VStack>
            </Page.Block>
        </Page>
        </div>
    );
}

import { FileIcon } from "@navikt/aksel-icons";
import {
  Alert,
  Bleed,
  BodyLong,
  Heading,
  Page,
  Search,
  Stack,
  VStack,
} from "@navikt/ds-react";
import { Form } from "react-router";

export default function Info() {
  return (
    <Page>
      <Page.Block width="text" gutters>
        <VStack as="main" gap="8">
          <Bleed marginInline={{ lg: "24" }}>
            <Stack
              gap="6"
              direction={{ sm: "row-reverse", lg: "row" }}
              justify={{ sm: "space-between", lg: "start" }}
              wrap={false}
            >
              <VStack gap="1">
                <Heading level="1" size="medium" align="start" className="mt-4">
                  <FileIcon title="a11y-title" className="inline-block mr-2" />
                  Oppslag på bruker i Nav
                </Heading>
                <BodyLong>
                  Ved å søke på fødselsnummer eller D-nummer i søkefeltet
                  nedenfor får du en enkel oversikt over en Nav bruker sine
                  forhold i Nav
                </BodyLong>
                <Alert variant="info" closeButton={true}>
                  Melding til saksbehandler. En informasjon om at man ikke må
                  bruke tjenesten dersom det ikke ligger tjenstlig behov til
                  grunn. Her kan det også oppgis hvilke lover og paragrafer som
                  gjelder.
                </Alert>

                <Form className="px-5 mt-12" method="post" action="/">
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
                </Form>
              </VStack>
            </Stack>
          </Bleed>
        </VStack>
      </Page.Block>
    </Page>
  );
}

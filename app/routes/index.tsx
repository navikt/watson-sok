import { FileIcon } from "@navikt/aksel-icons";
import {
  Alert,
  Bleed,
  BodyLong,
  Heading,
  Label,
  Page,
  Search,
  Stack,
  VStack,
} from "@navikt/ds-react";
import "~/globals.css";

import {
  type ActionFunctionArgs,
  Form,
  redirect,
  useActionData,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";

export default function LandingPage() {
  const actionData = useActionData<typeof action>();

  return (
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
                Ved å søke på fødselsnummer eller D-nummer i søkefeltet nedenfor
                får du en enkel oversikt over en Nav bruker sine forhold i Nav
              </BodyLong>

              <Alert variant="info" closeButton={true}>
                Melding til saksbehandler. En informasjon om at man ikke må
                bruke tjenesten dersom det ikke ligger tjenstlig behov til
                grunn. Her kan det også oppgis hvilke lover og paragrafer som
                gjelder.
              </Alert>

              <Form className="px-5 mt-12" method="post">
                <VStack>
                  <Label htmlFor="ident">Fødselsnummer/D-nummer</Label>
                  <Search
                    name="ident"
                    size="medium"
                    variant="primary"
                    placeholder="11 siffer"
                    label="Søk på fødselsnummer"
                    error={actionData?.error}
                  />
                </VStack>
              </Form>
            </VStack>
          </Stack>
        </Bleed>
      </VStack>
    </Page.Block>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const ident = formData.get("ident")?.toString().trim();
  if (ident && ident.length === 11 && ident.match(/^\d+$/)) {
    return redirect(RouteConfig.OPPSLAG.link(ident));
  }
  return { error: "Ugyldig fødselsnummer" };
}

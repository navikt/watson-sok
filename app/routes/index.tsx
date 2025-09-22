import { FileIcon } from "@navikt/aksel-icons";
import {
  Alert,
  Bleed,
  BodyShort,
  Heading,
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
  useNavigation,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { sporHendelse } from "~/utils/analytics";

export default function LandingPage() {
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();

  return (
    <Page.Block width="text" gutters>
      <title>Oppslag Bruker 1.0</title>
      <VStack as="main" gap="space-8">
        <Bleed marginInline={{ lg: "24" }}>
          <Stack
            gap="6"
            direction={{ sm: "row-reverse", lg: "row" }}
            justify={{ sm: "space-between", lg: "start" }}
            wrap={false}
          >
            <VStack gap="space-4">
              <Heading
                level="1"
                size="medium"
                align="start"
                className="mt-4"
                spacing
              >
                <FileIcon title="a11y-title" className="inline-block mr-2" />
                Oppslag på bruker i Nav
              </Heading>
              <BodyShort spacing>
                Ved å søke på fødselsnummer eller D-nummer i søkefeltet nedenfor
                får du en enkel oversikt over en Nav bruker sine relasjoner til
                Nav
              </BodyShort>

              <Alert
                variant="info"
                closeButton={true}
                title="Tjenestelig behov"
              >
                Det forutsettes at man har tjenestelig behov til grunn for å
                gjøre oppslaget.
              </Alert>

              <Form
                className="mt-12"
                method="post"
                role="search"
                onSubmit={() => sporHendelse("søk landingsside", {})}
              >
                <Search
                  name="ident"
                  size="medium"
                  variant="primary"
                  placeholder="11 siffer"
                  label="Fødselsnummer eller D-nummer på bruker"
                  hideLabel={false}
                  error={actionData?.error}
                  autoComplete="off"
                  htmlSize={15}
                >
                  <Search.Button
                    type="submit"
                    loading={navigation.state === "submitting"}
                  />
                </Search>
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

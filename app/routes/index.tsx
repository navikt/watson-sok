import { FileIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Heading, Search } from "@navikt/ds-react";
import "~/globals.css";

import { PageBlock } from "@navikt/ds-react/Page";
import {
  type ActionFunctionArgs,
  Form,
  redirectDocument,
  useActionData,
  useNavigation,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { lagreIdentPåSession } from "~/features/oppslag/oppslagSession.server";
import { sporHendelse } from "~/utils/analytics";

export default function LandingPage() {
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();

  return (
    <PageBlock width="text" gutters>
      <title>Oppslag Bruker 1.0</title>
      <div>
        <Heading level="1" size="medium" align="start" className="mt-4" spacing>
          <FileIcon title="a11y-title" className="inline-block mr-2" />
          Oppslag på bruker i Nav
        </Heading>
        <BodyShort spacing>
          Ved å søke på fødselsnummer eller D-nummer i søkefeltet nedenfor får
          du en enkel oversikt over en Nav bruker sine relasjoner til Nav
        </BodyShort>

        <Alert variant="info">
          <Heading level="2" size="small" spacing>
            Tjenestelig behov
          </Heading>
          Det forutsettes at man har tjenestelig behov til grunn for å gjøre
          oppslaget.
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
              loading={navigation.state !== "idle"}
            />
          </Search>
        </Form>
      </div>
    </PageBlock>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const ident = formData.get("ident")?.toString().trim();
  if (ident && ident.length === 11 && ident.match(/^\d+$/)) {
    return redirectDocument(RouteConfig.OPPSLAG, {
      headers: {
        "Set-Cookie": await lagreIdentPåSession(ident, request),
      },
    });
  }
  return { error: "Ugyldig fødselsnummer" };
}

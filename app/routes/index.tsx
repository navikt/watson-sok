import { Alert, BodyShort, Heading, Link, Search } from "@navikt/ds-react";
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
      <title>Oppslag bruker</title>
      <meta name="description" content="Oppslag på personer i Nav" />
      <div>
        <Heading level="2" size="medium" align="start" className="mt-4" spacing>
          Brukeroppslag
        </Heading>
        <BodyShort spacing>
          Ved å søke på fødsels- eller D-nummer får du en oversikt over relevant
          informasjon om en bruker. Merk at alle søk blir loggført.
        </BodyShort>

        <Form
          className="mt-12 mb-2"
          method="post"
          role="search"
          onSubmit={() => sporHendelse("søk landingsside", {})}
        >
          <Search
            name="ident"
            size="medium"
            variant="primary"
            placeholder="11 siffer"
            label="Fødsels- eller D-nummer"
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
        <BodyShort spacing>
          <Link href="https://pdl-web.intern.nav.no/sokperson">
            Har du ikke fødsels- eller D-nummer?
          </Link>
        </BodyShort>

        <Alert variant="info">
          <Heading level="3" size="small" spacing>
            Tjenestelig behov
          </Heading>
          Det forutsettes at man har tjenestelig behov til grunn for å gjøre
          oppslaget.
        </Alert>
      </div>
    </PageBlock>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rawIdent = formData.get("ident")?.toString().replace(/\s+/g, "");
  const leggTilTraceHeader = rawIdent?.endsWith("?");
  const ident = rawIdent?.replace("?", "");
  if (ident && ident.length === 11 && ident.match(/^\d+$/)) {
    return redirectDocument(
      RouteConfig.OPPSLAG + (leggTilTraceHeader ? "?traceLogging=true" : ""),
      {
        headers: {
          "Set-Cookie": await lagreIdentPåSession(ident, request),
        },
      },
    );
  }
  return { error: "Ugyldig fødselsnummer" };
}

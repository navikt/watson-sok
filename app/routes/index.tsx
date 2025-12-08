import {
  Alert,
  BodyLong,
  BodyShort,
  Heading,
  Link,
  Search,
} from "@navikt/ds-react";
import "~/globals.css";

import { Page, PageBlock } from "@navikt/ds-react/Page";
import { useEffect, useState } from "react";
import {
  type ActionFunctionArgs,
  data,
  Form,
  redirectDocument,
  useActionData,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import {
  hentSøkedataFraSession,
  lagreSøkeinfoPåSession,
} from "~/features/oppslag/oppslagSession.server";
import { useMiljø } from "~/features/use-miljø/useMiljø";
import { sporHendelse } from "~/utils/analytics";
import { logger } from "~/utils/logging";
import { sjekkEksistensOgTilgang } from "./oppslag/api.server";

export default function LandingPage() {
  const miljø = useMiljø();
  const actionData = useActionData<typeof action>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      setIsLoading(false);
    }
  }, [actionData]);

  return (
    <Page>
      <PageBlock width="text" gutters>
        <title>{`Watson Søk ${miljø !== "prod" ? `(${miljø})` : ""}`}</title>
        <meta name="description" content="Oppslag på personer i Nav" />
        <div>
          <Heading
            level="2"
            size="medium"
            align="start"
            className="mt-4"
            spacing
          >
            Brukeroppslag
          </Heading>
          <BodyShort spacing>
            Ved å søke på fødsels- eller D-nummer får du en oversikt over
            relevant informasjon om en bruker.
          </BodyShort>

          <Form
            className="mt-12 mb-2"
            method="post"
            role="search"
            onSubmit={() => {
              sporHendelse("søk landingsside");
              setIsLoading(true);
            }}
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
              <Search.Button type="submit" loading={isLoading} />
            </Search>
          </Form>
          <BodyShort spacing className="mt-2">
            <Link href="https://pdl-web.intern.nav.no/sokperson">
              Har du ikke fødsels- eller D-nummer?
            </Link>
          </BodyShort>

          <Alert variant="info" className="mt-4">
            <Heading level="3" size="small" spacing>
              Tjenestlig behov
            </Heading>
            <BodyLong>
              Brukeroppslag forutsetter tjenestlig behov.
              <br />
              Merk at alle søk logges.
            </BodyLong>
          </Alert>
        </div>
      </PageBlock>
    </Page>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const råIdent = formData.get("ident")?.toString().replace(/\s+/g, "");

  const leggTilTraceHeader = råIdent?.endsWith("?") ?? false;
  const ident = råIdent?.replace("?", "");

  if (!ident || ident.length !== 11 || !ident.match(/^\d+$/)) {
    return { error: "Ugyldig fødsels- eller D-nummer" };
  }

  try {
    const eksistensOgTilgang = await sjekkEksistensOgTilgang({
      ident,
      request,
      navCallId: crypto.randomUUID(),
      traceLogging: leggTilTraceHeader,
    });

    if (eksistensOgTilgang.tilgang === "IKKE_FUNNET") {
      const cookie = await lagreSøkeinfoPåSession(
        {
          ident,
          tilgang: "IKKE_FUNNET",
          harUtvidetTilgang: eksistensOgTilgang.harUtvidetTilgang,
          bekreftetBegrunnetTilgang: false,
        },
        request,
      );
      return data(
        { error: "Bruker ikke funnet" },
        { headers: { "Set-Cookie": cookie } },
      );
    }

    const eksisterendeSøkedata = await hentSøkedataFraSession(request);

    const harAlleredeBekreftetBegrunnetTilgang =
      eksisterendeSøkedata.ident === ident &&
      eksisterendeSøkedata.bekreftetBegrunnetTilgang;

    const cookie = await lagreSøkeinfoPåSession(
      {
        ident,
        tilgang: eksistensOgTilgang.tilgang,
        harUtvidetTilgang: eksistensOgTilgang.harUtvidetTilgang,
        bekreftetBegrunnetTilgang: harAlleredeBekreftetBegrunnetTilgang,
      },
      request,
    );

    if (
      eksistensOgTilgang.tilgang === "OK" ||
      eksistensOgTilgang.harUtvidetTilgang ||
      harAlleredeBekreftetBegrunnetTilgang
    ) {
      return redirectDocument(
        RouteConfig.OPPSLAG + (leggTilTraceHeader ? "?traceLogging=true" : ""),
        {
          headers: {
            "Set-Cookie": cookie,
          },
        },
      );
    }

    return redirectDocument(RouteConfig.TILGANG, {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    logger.error("En feil oppsto ved søking på bruker.", { error });
    return { error: "En feil oppsto ved søking på bruker. Prøv igjen senere." };
  }
}

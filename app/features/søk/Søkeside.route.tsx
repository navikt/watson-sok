import {
  Alert,
  BodyLong,
  BodyShort,
  Heading,
  Link,
  Page,
  Search,
} from "@navikt/ds-react";
import { PageBlock } from "@navikt/ds-react/Page";
import { SearchButton } from "@navikt/ds-react/Search";
import { useEffect, useState } from "react";
import { Form, useActionData } from "react-router";
import { sporHendelse } from "../analytics/analytics";
import { useMiljø } from "../miljø/useMiljø";
import { søkAction } from "./action.server";

export const action = søkAction;

export default function Søkeside() {
  const actionData = useActionData<typeof action>();
  const miljø = useMiljø();
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
              disabled={isLoading}
            >
              <SearchButton
                type="submit"
                loading={isLoading}
                disabled={isLoading}
              />
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

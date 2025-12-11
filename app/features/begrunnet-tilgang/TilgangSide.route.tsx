import {
  BodyLong,
  Button,
  ErrorMessage,
  Heading,
  Label,
  useId,
} from "@navikt/ds-react";
import { Page, PageBlock } from "@navikt/ds-react/Page";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { sporHendelse } from "~/features/analytics/analytics";
import { useMiljø } from "~/features/use-miljø/useMiljø";
import type { action } from "./action.server";
import type { loader } from "./loader.server";

export default function TilgangSide() {
  const {
    grunnForBegrensetTilgang,
    harUtvidetTilgang,
    erKode6Eller7EllerUtland,
    erSkjermetBruker,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const miljø = useMiljø();

  if (erSkjermetBruker) {
    return (
      <Page>
        <PageBlock width="text" gutters>
          <title>{`Begrenset tilgang – Watson Søk ${miljø !== "prod" ? `(${miljø})` : ""}`}</title>
          <meta
            name="description"
            content="Begrenset tilgang til informasjon om bruker"
          />
          <Heading
            level="2"
            size="medium"
            align="start"
            className="mt-4"
            spacing
          >
            Begrenset tilgang
          </Heading>
          <BodyLong spacing>
            Du har bedt om tilgang til å se informasjon om en person som er
            ansatt i Nav. I følge tilgangene har du begrenset tilgang til å se
            informasjonen. Ta kontakt med nærmeste leder for veiledning.
          </BodyLong>
          <div className="flex justify-end">
            <Button
              variant="primary"
              type="button"
              onClick={() => navigate(RouteConfig.INDEX)}
            >
              Søk på annen bruker
            </Button>
          </div>
        </PageBlock>
      </Page>
    );
  }
  return (
    <Page>
      <PageBlock width="text" gutters>
        <title>
          {`Bekreft ønsket tilgang – Watson Søk ${miljø !== "prod" ? `(${miljø})` : ""}`}
        </title>
        <meta name="description" content="Oppslag på personer i Nav" />
        <Heading level="2" size="medium" align="start" className="mt-4" spacing>
          Bekreft ønsket tilgang
        </Heading>
        <BodyLong spacing>
          Du har bedt om tilgang til å se informasjon om en person. I følge
          tilgangene har du begrenset tilgang til å se informasjonen, fordi{" "}
          <strong>{grunnForBegrensetTilgang}</strong>.
        </BodyLong>
        <BodyLong spacing>
          Om du allikevel ønsker å se informasjon om brukeren, kan du skrive en
          begrunnelse, og bekrefte at du allikevel har tjenestlig behov ved å
          trykke på knappen under. Både begrunnelse og bekreftelse vil bli
          loggført.
        </BodyLong>
        {!harUtvidetTilgang && erKode6Eller7EllerUtland && (
          <BodyLong spacing>
            <strong>Merk:</strong> Siden brukeren har adresseskjerming, vil all
            geolokaliserende informasjon være sensurert. Ta kontakt med nærmeste
            leder for å få tilgang til denne informasjonen.
          </BodyLong>
        )}
        <Form
          method="post"
          className="flex flex-col gap-2"
          onSubmit={() => {
            sporHendelse("skjermingsbegrunnelse utfylt", {
              skjermingsbehov: grunnForBegrensetTilgang,
            });
          }}
        >
          <Textarea
            name="begrunnelse"
            label="Begrunnelse"
            error={actionData?.error}
          />

          <div className="flex justify-end gap-2">
            <Button variant="primary" type="submit" loading={isSubmitting}>
              Bekreft at du har tjenestlig behov
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                sporHendelse("skjermingsbegrunnelse avbrutt", {
                  skjermingsbehov: grunnForBegrensetTilgang,
                });
                navigate(RouteConfig.INDEX);
              }}
            >
              Søk på en annen bruker
            </Button>
          </div>
        </Form>
      </PageBlock>
    </Page>
  );
}

type TextareaProps = {
  name: string;
  label: string;
  error: string | undefined;
};
/** En litt dummere textarea-komponent enn det Aksel har.
 *
 * Grunnen til at vi ikke kan bruke Aksel sin, er at den har en lei glitch, der høyden er 0 på første render (på serversiden). Når den buggen er fikset, kan denne komponenten fjernes.
 */
function Textarea({ name, label, error }: TextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div
      className={`aksel-form-field aksel-textarea ${error ? "aksel-form-field--error" : ""}`}
    >
      <Label htmlFor={id} className="aksel-form-field__label">
        {label}
      </Label>
      <textarea
        name={name}
        id={id}
        className="aksel-textarea__input aksel-body-short aksel-body-short--medium"
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <div
          id={errorId}
          className="aksel-form-field__error"
          aria-relevant="additions removals"
          aria-live="polite"
        >
          <ErrorMessage showIcon>{error}</ErrorMessage>
        </div>
      )}
    </div>
  );
}

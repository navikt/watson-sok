import {
  BodyLong,
  Button,
  ErrorMessage,
  Heading,
  Label,
  useId,
} from "@navikt/ds-react";
import { PageBlock } from "@navikt/ds-react/Page";
import {
  Form,
  redirect,
  redirectDocument,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import {
  hentSøkedataFraSession,
  lagreSøkeinfoPåSession,
} from "~/features/oppslag/oppslagSession.server";
import { loggBegrunnetTilgang } from "./api.server";

export default function BekreftSide() {
  const {
    grunnForBegrensetTilgang,
    harUtvidetTilgang,
    erKode6Eller7EllerUtland,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <PageBlock width="text" gutters>
      <title>Bekreft ønsket tilgang – Oppslag bruker</title>
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
        begrunnelse, og bekrefte at du allikevel har tjenestelig behov ved å
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
      <Form method="post" className="flex flex-col gap-2">
        <Textarea
          name="begrunnelse"
          label="Begrunnelse"
          error={actionData?.error}
        />

        <div className="flex justify-end gap-2">
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Bekreft at du har tjenestelig behov
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate(RouteConfig.INDEX)}
          >
            Søk på en annen bruker
          </Button>
        </div>
      </Form>
    </PageBlock>
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { ident, bekreftetBegrunnetTilgang, tilgang, harUtvidetTilgang } =
    await hentSøkedataFraSession(request);

  if (!ident || !tilgang) {
    return redirect(RouteConfig.INDEX);
  }

  if (bekreftetBegrunnetTilgang || tilgang === "OK") {
    return redirect(RouteConfig.OPPSLAG);
  }

  return {
    ident,
    bekreftetBegrunnetTilgang,
    tilgang,
    harUtvidetTilgang,
    grunnForBegrensetTilgang: mapGrunnForBegrensetTilgang(tilgang),
    erKode6Eller7EllerUtland: [
      "AVVIST_STRENGT_FORTROLIG_ADRESSE",
      "AVVIST_STRENGT_FORTROLIG_UTLAND",
      "AVVIST_FORTROLIG_ADRESSE",
    ].includes(tilgang),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const begrunnelse = formData.get("begrunnelse")?.toString().trim();
  if (!begrunnelse) {
    return { error: "Begrunnelse er påkrevd" };
  }
  const { ident, tilgang, harUtvidetTilgang } =
    await hentSøkedataFraSession(request);

  if (!ident || !tilgang) {
    return redirect(RouteConfig.INDEX);
  }

  const cookie = await lagreSøkeinfoPåSession(
    {
      ident,
      tilgang,
      harUtvidetTilgang,
      bekreftetBegrunnetTilgang: true,
    },
    request,
  );
  try {
    await loggBegrunnetTilgang({
      ident,
      begrunnelse,
      mangel: tilgang,
      request,
    });
    return redirectDocument(RouteConfig.OPPSLAG, {
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch {
    return {
      error: "En feil oppsto ved loggning av begrunnelse. Prøv igjen senere.",
    };
  }
}

const mapGrunnForBegrensetTilgang = (grunnForBegrensetTilgang: string) => {
  switch (grunnForBegrensetTilgang) {
    case "AVVIST_STRENGT_FORTROLIG_ADRESSE":
      return "brukeren har strengt fortrolig adresse";
    case "AVVIST_STRENGT_FORTROLIG_UTLAND":
      return "brukeren har strengt fortrolig adresse i utlandet";
    case "AVVIST_FORTROLIG_ADRESSE":
      return "brukeren har fortrolig adresse";
    case "AVVIST_GEOGRAFISK":
      return "du ikke har tilgang til brukerens geografiske område eller enhet";
    case "AVVIST_AVDOED":
    case "AVVIST_AVDØD":
      return "brukeren har vært død i mer enn x måneder";
    case "AVVIST_SKJERMING":
      return "brukeren er Nav-ansatt eller annen skjermet bruker";
    case "AVVIST_HABILITET":
      return "du ikke har tilgang til å se informasjon om deg selv eller dine nærmeste";
    case "AVVIST_VERGE":
      return "du er registrert som brukerens verge";
    case "AVVIST_MANGLENDE_DATA":
      return "manglende data i systemet gjør at vi ikke kan gi deg tilgang automatisk";
    default:
      return "en ukjent grunn";
  }
};

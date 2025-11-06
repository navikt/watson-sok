import { Alert, CopyButton, Skeleton } from "@navikt/ds-react";
import { Fragment, use } from "react";
import { unstable_useRoute } from "react-router";
import type { PersonInformasjon } from "~/routes/oppslag/schemas";
import { formatterAdresse } from "~/utils/adresse-utils";
import { formatterDato } from "~/utils/date-utils";
import { tilFulltNavn } from "~/utils/navn-utils";
import {
  formatterFødselsnummer,
  storFørsteBokstav,
  storFørsteBokstavPerOrd,
} from "~/utils/string-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";
import { FeatureFlagg } from "../feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "../feature-toggling/useFeatureFlagg";
import { FamiliemedlemmerModal } from "./FamiliemedlemmerModal";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type BrukerinformasjonProps = {
  promise: Promise<PersonInformasjon | null>;
};
/**
 * Komponent som viser personlig informasjon om en bruker
 */
export function BrukerinformasjonPanel({ promise }: BrukerinformasjonProps) {
  return (
    <ResolvingComponent loadingFallback={<BrukerinformasjonPanelSkeleton />}>
      <BrukerinformasjonPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type BrukerinformasjonPanelMedDataProps = {
  promise: Promise<PersonInformasjon | null>;
};
const BrukerinformasjonPanelMedData = ({
  promise,
}: BrukerinformasjonPanelMedDataProps) => {
  const personopplysninger = use(promise);
  const { loaderData: rootData } = unstable_useRoute("root");
  const visFødselsOgDødsdato = useEnkeltFeatureFlagg(
    FeatureFlagg.VIS_FØDSELS_OG_DØDSDATO,
  );

  if (!personopplysninger || !rootData) {
    return (
      <PanelContainer
        title="Brukerinformasjon"
        link={{
          href: "https://modiapersonoversikt.intern.nav.no/person/oversikt",
          beskrivelse: "Historikk",
        }}
      >
        <Alert variant="warning" className="w-fit">
          Fant ikke brukerinformasjon
        </Alert>
      </PanelContainer>
    );
  }
  const erDNummer = Number(personopplysninger.aktørId?.charAt(0)) > 3;
  const fulltNavn = tilFulltNavn(personopplysninger.navn);
  const folkeregistrertAdresse = formatterAdresse(personopplysninger.adresse);

  return (
    <PanelContainer
      title="Brukerinformasjon"
      link={{
        href: `${rootData.envs.modiaUrl}/person/oversikt`,
        beskrivelse: "Historikk",
      }}
    >
      <dl className="grid sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-4 gap-y-2 [&>dt]:font-bold [&>dd]:flex [&>dd]:items-center [&>dd]:min-h-7">
        <dt>Navn</dt>
        <dd>
          {tilFulltNavn(personopplysninger.navn)}{" "}
          <KopiKnapp copyText={fulltNavn} />
        </dd>
        {personopplysninger.aktørId && (
          <>
            <dt>{erDNummer ? "D-nummer" : "Fødselsnummer"}</dt>
            <dd>
              {formatterFødselsnummer(personopplysninger.aktørId)}&nbsp;
              <KopiKnapp copyText={personopplysninger.aktørId} />
            </dd>
          </>
        )}
        {visFødselsOgDødsdato && (
          <>
            {personopplysninger.fødselsdato && (
              <>
                <dt>Fødselsdato</dt>
                <dd>{formatterDato(personopplysninger.fødselsdato)}</dd>
              </>
            )}
            {personopplysninger.dødsdato && (
              <>
                <dt>Dødsdato</dt>
                <dd>{formatterDato(personopplysninger.dødsdato)}</dd>
              </>
            )}
          </>
        )}
        {folkeregistrertAdresse && (
          <>
            <dt>Folkeregistrert adresse</dt>
            <dd>
              {folkeregistrertAdresse}&nbsp;
              <KopiKnapp copyText={folkeregistrertAdresse} />
            </dd>
          </>
        )}
        <dt>Statsborgerskap</dt>
        <dd>
          {personopplysninger.statsborgerskap
            .map(storFørsteBokstavPerOrd)
            .join(", ")}
        </dd>
        <dt>Sivilstand</dt>
        <dd>{storFørsteBokstav(personopplysninger.sivilstand ?? "Ukjent")}</dd>
        <dt>Familiemedlemmer</dt>
        <dd>
          <FamiliemedlemmerModal
            familiemedlemmer={personopplysninger.familemedlemmer}
          />
        </dd>
      </dl>
    </PanelContainer>
  );
};

const BrukerinformasjonPanelSkeleton = () => {
  const linjer = Array.from({ length: 6 }, (_, index) => index);
  return (
    <PanelContainerSkeleton
      title="Brukerinformasjon"
      link={{ href: "https://modia.nav.no", beskrivelse: "Historikk" }}
    >
      <dl className="grid sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-4 gap-y-2 [&>dt]:font-bold [&>dd]:flex [&>dd]:items-center [&>dd]:min-h-7">
        {linjer.map((_, idx) => (
          <Fragment key={idx}>
            <dt>
              <Skeleton variant="text" width="70%" />
            </dt>
            <dd>
              <Skeleton variant="text" width="100%" />
            </dd>
          </Fragment>
        ))}
      </dl>
    </PanelContainerSkeleton>
  );
};

type KopiKnappProps = {
  copyText: string;
};
const KopiKnapp = ({ copyText }: KopiKnappProps) => {
  return (
    <CopyButton
      copyText={copyText}
      size="xsmall"
      className="inline-block ml-1"
    />
  );
};

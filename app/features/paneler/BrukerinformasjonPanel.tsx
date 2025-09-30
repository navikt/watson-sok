import { Alert, CopyButton, Skeleton } from "@navikt/ds-react";
import { Fragment, use } from "react";
import type { PersonInformasjon } from "~/routes/oppslag/schemas";
import { formatterAdresse } from "~/utils/adresse-utils";
import { tilFulltNavn } from "~/utils/navn-utils";
import {
  formatterFødselsnummer,
  storFørsteBokstav,
  storFørsteBokstavPerOrd,
} from "~/utils/string-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";
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

  if (!personopplysninger) {
    return (
      <PanelContainer
        title="Brukerinformasjon"
        link={{ href: "https://modia.nav.no", beskrivelse: "Historikk" }}
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
  const antallFamilemedlemmer = Object.keys(
    personopplysninger.familemedlemmer ?? {},
  ).length;

  return (
    <PanelContainer
      title="Brukerinformasjon"
      link={{ href: "https://modia.nav.no", beskrivelse: "Historikk" }}
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
        <dt>Familemedlemmer</dt>
        <dd>
          {antallFamilemedlemmer}{" "}
          {antallFamilemedlemmer === 1 ? "familiemedlem" : "familemedlemmer"}
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

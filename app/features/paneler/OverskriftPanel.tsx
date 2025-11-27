import { Heading, Skeleton, Tag, Tooltip } from "@navikt/ds-react";
import { use } from "react";
import type { PersonInformasjon } from "~/routes/oppslag/schemas";
import { tilFulltNavn } from "~/utils/navn-utils";
import { storFørsteBokstavPerOrd } from "~/utils/string-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";

type OverskriftPanelProps = {
  promise: Promise<PersonInformasjon | null>;
};

export const OverskriftPanel = ({ promise }: OverskriftPanelProps) => {
  return (
    <ResolvingComponent
      loadingFallback={<OverskriftPanelSkeleton />}
      errorFallback={<OverskriftPanelError />}
    >
      <OverskriftPanelMedData promise={promise} />
    </ResolvingComponent>
  );
};

const OverskriftPanelMedData = ({ promise }: OverskriftPanelProps) => {
  const personopplysninger = use(promise);
  if (!personopplysninger) {
    return (
      <Heading level="1" size="large">
        Fant ikke bruker
      </Heading>
    );
  }
  return (
    <Heading level="1" size="large" className="flex items-center gap-2">
      {storFørsteBokstavPerOrd(tilFulltNavn(personopplysninger.navn), true)} (
      {personopplysninger.alder}){personopplysninger.dødsdato ? ` (død)` : ""}
      {personopplysninger.adresseBeskyttelse !== "UGRADERT" && (
        <Tooltip
          content={lagAdressebeskyttelseBeskrivelse(
            personopplysninger.adresseBeskyttelse,
          )}
        >
          <Tag variant="error" size="small">
            Diskresjon
          </Tag>
        </Tooltip>
      )}
    </Heading>
  );
};

const OverskriftPanelSkeleton = () => {
  return (
    <Heading level="1" size="large" as="div">
      <Skeleton variant="text" width="100%">
        Navn Navnesen (xx)
      </Skeleton>
    </Heading>
  );
};

const OverskriftPanelError = () => {
  return (
    <Heading level="1" size="large">
      Feil ved henting av bruker
    </Heading>
  );
};

function lagAdressebeskyttelseBeskrivelse(
  adresseBeskyttelse: PersonInformasjon["adresseBeskyttelse"],
): string {
  switch (adresseBeskyttelse) {
    case "FORTROLIG":
      return "Brukeren har fortrolig adresse";
    case "STRENGT_FORTROLIG":
      return "Brukeren har strengt fortrolig adresse";
    case "STRENGT_FORTROLIG_UTLAND":
      return "Brukeren har strengt fortrolig adresse i utlandet";
    default:
      return "";
  }
}

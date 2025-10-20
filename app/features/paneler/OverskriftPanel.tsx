import { Heading, Skeleton } from "@navikt/ds-react";
import { use } from "react";
import type { PersonInformasjon } from "~/routes/oppslag/schemas";
import { tilFulltNavn } from "~/utils/navn-utils";
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
    <Heading level="1" size="large">
      {tilFulltNavn(personopplysninger.navn)} ({personopplysninger.alder})
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

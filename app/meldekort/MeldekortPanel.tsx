import { Alert, BodyShort, Skeleton } from "@navikt/ds-react";
import { use } from "react";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import type { MeldekortRespons } from "./domene";

type MeldekortPanelProps = {
  promise: Promise<MeldekortRespons | null | undefined>;
};

/** Placeholder-panel for meldekort */
export function MeldekortPanel({ promise }: MeldekortPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<MeldekortPanelSkeleton />}>
      <MeldekortPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type MeldekortPanelMedDataProps = {
  promise: Promise<MeldekortRespons | null | undefined>;
};

const MeldekortPanelMedData = ({ promise }: MeldekortPanelMedDataProps) => {
  const meldekort = use(promise);

  return (
    <PanelContainer title="Meldekort, dagpenger">
      {!meldekort ? (
        <Alert variant="warning" className="w-fit">
          Fant ikke meldekort
        </Alert>
      ) : meldekort.length === 0 ? (
        <Alert variant="info" className="w-fit">
          Ingen meldekort registrert
        </Alert>
      ) : (
        <BodyShort>Meldekortvisning kommer senere.</BodyShort>
      )}
    </PanelContainer>
  );
};

const MeldekortPanelSkeleton = () => {
  return (
    <PanelContainerSkeleton title="Meldekort">
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" width="45%" />
      </div>
    </PanelContainerSkeleton>
  );
};

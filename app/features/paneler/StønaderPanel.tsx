import {
  BabyWrappedIcon,
  BriefcaseClockIcon,
  FeedingBottleIcon,
  HospitalIcon,
  HouseHeartIcon,
  NokIcon,
} from "@navikt/aksel-icons";
import { Alert, BodyShort, Skeleton, Timeline } from "@navikt/ds-react";

import { toDate } from "date-fns";
import { use } from "react";
import { ResolvingComponent } from "~/features/async/ResolvingComponent";
import type { Stonad } from "~/routes/oppslag/schemas";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type StonadOversiktProps = {
  promise: Promise<Stonad[] | null>;
};

export function StønaderPanel({ promise }: StonadOversiktProps) {
  return (
    <ResolvingComponent loadingFallback={<StønaderPanelSkeleton />}>
      <StønaderPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type StønaderPanelMedDataProps = {
  promise: Promise<Stonad[] | null>;
};
const StønaderPanelMedData = ({ promise }: StønaderPanelMedDataProps) => {
  const stønader = use(promise);
  const harIngenStønader = !stønader || stønader.length === 0;

  return (
    <PanelContainer title="Stønader">
      {harIngenStønader ? (
        <Alert variant="info" className="w-fit">
          Ingen ytelser eller stønader registrert de siste 3 årene.
        </Alert>
      ) : (
        <Timeline>
          {stønader.map((stønad) => {
            return (
              <Timeline.Row
                key={stønad.stonadType}
                label={stønad.stonadType}
                icon={mapStønadtypeTilIkon(stønad.stonadType)}
              >
                {stønad.perioder.map((stønadsperiode) => (
                  <Timeline.Period
                    key={stønadsperiode.info}
                    start={toDate(stønadsperiode.periode.fom)}
                    end={toDate(stønadsperiode.periode.tom)}
                    status={
                      stønadsperiode.beløp === 0.0 ? "warning" : "success"
                    }
                    icon={mapStønadtypeTilIkon(stønad.stonadType)}
                  >
                    <BodyShort className="font-medium">
                      {stønadsperiode.beløp.toLocaleString()} kr
                    </BodyShort>
                    <BodyShort className="text-sm text-muted-foreground">
                      Kilde: {stønadsperiode.kilde}
                      {stønadsperiode.info}
                    </BodyShort>
                    <BodyShort className="text-sm text-muted-foreground">
                      Bilag: {stønadsperiode.info}
                    </BodyShort>
                  </Timeline.Period>
                ))}
              </Timeline.Row>
            );
          })}
        </Timeline>
      )}
    </PanelContainer>
  );
};

const StønaderPanelSkeleton = () => {
  const stønader = Array.from({ length: 3 }, (_, index) => index);
  return (
    <PanelContainerSkeleton title="Stønader">
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex gap-2">
          <div className="w-[15%]" />
          <Skeleton variant="text" width="85%" className="self-end" />
        </div>
        {stønader.map((_, idx) => (
          <div className="flex gap-2" key={idx}>
            <Skeleton variant="text" width="15%" />
            <Skeleton variant="rounded" width="85%" />
          </div>
        ))}
      </div>
    </PanelContainerSkeleton>
  );
};

const mapStønadtypeTilIkon = (stønadtype: string) => {
  switch (stønadtype) {
    case "Sykepenger":
      return <HospitalIcon />;
    case "Uføretrygd":
      return <HouseHeartIcon />;
    case "Arbeidsavklaringspenger":
      return <BriefcaseClockIcon />;
    case "Foreldrepenger":
      return <FeedingBottleIcon />;
    case "Svangerskapspenger":
      return <BabyWrappedIcon />;
    default:
      return <NokIcon />;
  }
};

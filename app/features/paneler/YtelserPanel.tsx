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
import type { Ytelse } from "~/routes/oppslag/schemas";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type StonadOversiktProps = {
  promise: Promise<Ytelse[] | null>;
};

export function YtelserPanel({ promise }: StonadOversiktProps) {
  return (
    <ResolvingComponent loadingFallback={<YtelserPanelSkeleton />}>
      <YtelserPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type StønaderPanelMedDataProps = {
  promise: Promise<Ytelse[] | null>;
};
const YtelserPanelMedData = ({ promise }: StønaderPanelMedDataProps) => {
  const ytelser = use(promise);
  const harIngenYtelser = !ytelser || ytelser.length === 0;

  return (
    <PanelContainer title="Ytelser">
      {harIngenYtelser ? (
        <Alert variant="info" className="w-fit">
          Ingen ytelser registrert de siste 3 årene.
        </Alert>
      ) : (
        <Timeline>
          {ytelser.map((ytelse) => {
            return (
              <Timeline.Row
                key={ytelse.stonadType}
                label={ytelse.stonadType}
                icon={mapYtelsestypeTilIkon(ytelse.stonadType)}
              >
                {ytelse.perioder.map((ytelsesperiode) => (
                  <Timeline.Period
                    key={ytelsesperiode.info}
                    start={toDate(ytelsesperiode.periode.fom)}
                    end={toDate(ytelsesperiode.periode.tom)}
                    status={
                      ytelsesperiode.beløp === 0.0 ? "warning" : "success"
                    }
                    icon={mapYtelsestypeTilIkon(ytelse.stonadType)}
                  >
                    <BodyShort className="font-medium">
                      {ytelsesperiode.beløp.toLocaleString()} kr
                    </BodyShort>
                    <BodyShort className="text-sm text-muted-foreground">
                      Kilde: {ytelsesperiode.kilde}
                      {ytelsesperiode.info}
                    </BodyShort>
                    <BodyShort className="text-sm text-muted-foreground">
                      Bilag: {ytelsesperiode.info}
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

const YtelserPanelSkeleton = () => {
  const ytelser = Array.from({ length: 3 }, (_, index) => index);
  return (
    <PanelContainerSkeleton title="Ytelser">
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex gap-2">
          <div className="w-[15%]" />
          <Skeleton variant="text" width="85%" className="self-end" />
        </div>
        {ytelser.map((_, idx) => (
          <div className="flex gap-2" key={idx}>
            <Skeleton variant="text" width="15%" />
            <Skeleton variant="rounded" width="85%" />
          </div>
        ))}
      </div>
    </PanelContainerSkeleton>
  );
};

const mapYtelsestypeTilIkon = (stønadtype: string) => {
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

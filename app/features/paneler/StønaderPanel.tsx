import {
  BabyWrappedIcon,
  BriefcaseClockIcon,
  FeedingBottleIcon,
  HospitalIcon,
  HouseHeartIcon,
  NokIcon,
} from "@navikt/aksel-icons";
import { Alert, BodyShort, Timeline } from "@navikt/ds-react";

import { toDate } from "date-fns";
import type { Stonad } from "~/routes/oppslag/[ident]/schemas";
import { PanelContainer } from "./PanelContainer";

type StonadOversiktProps = {
  stønader: Stonad[];
};

export function StønaderPanel({ stønader }: StonadOversiktProps) {
  const harIngenStønader = !stønader || stønader.length === 0;

  return (
    <PanelContainer title="Stønader">
      {harIngenStønader ? (
        <Alert variant="info">
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
}

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

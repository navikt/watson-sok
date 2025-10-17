import { Alert, Skeleton, Timeline } from "@navikt/ds-react";

import { differenceInDays, toDate } from "date-fns";
import { use, useMemo } from "react";
import { ResolvingComponent } from "~/features/async/ResolvingComponent";
import type { Ytelse } from "~/routes/oppslag/schemas";
import { formatterDato } from "~/utils/date-utils";
import { formatterBeløp } from "~/utils/number-utils";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";
import { mapYtelsestypeTilIkon } from "./mapYtelsestypeTilIkon";

type GruppertPeriode = {
  fom: string;
  tom: string;
  totalBeløp: number;
};

type YtelserOversiktProps = {
  promise: Promise<Ytelse[] | null>;
};

export function YtelserPanel({ promise }: YtelserOversiktProps) {
  return (
    <ResolvingComponent loadingFallback={<YtelserPanelSkeleton />}>
      <YtelserPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type YtelserPanelMedDataProps = {
  promise: Promise<Ytelse[] | null>;
};
const YtelserPanelMedData = ({ promise }: YtelserPanelMedDataProps) => {
  const ytelser = use(promise);
  const harIngenYtelser = !ytelser || ytelser.length === 0;

  const ytelserMedGruppertePerioder = useMemo(() => {
    if (!ytelser) return [];
    return ytelser.map((ytelse) => ({
      ...ytelse,
      gruppertePerioder: grupperSammenhengendePerioder(ytelse.perioder),
    }));
  }, [ytelser]);

  return (
    <PanelContainer title="Ytelser">
      {harIngenYtelser ? (
        <Alert variant="info" className="w-fit">
          Ingen ytelser registrert de siste 3 årene.
        </Alert>
      ) : (
        <Timeline>
          {ytelserMedGruppertePerioder.map((ytelse) => {
            return (
              <Timeline.Row
                key={ytelse.stonadType}
                label={ytelse.stonadType}
                icon={mapYtelsestypeTilIkon(ytelse.stonadType)}
              >
                {ytelse.gruppertePerioder.map((groupedPeriod, index) => {
                  const fomDate = toDate(groupedPeriod.fom);
                  const tomDate = toDate(groupedPeriod.tom);
                  const fomFormatert = formatterDato(groupedPeriod.fom);
                  const tomFormatert = formatterDato(groupedPeriod.tom);
                  const beløpFormatert = formatterBeløp(
                    groupedPeriod.totalBeløp,
                    0,
                  );

                  return (
                    <Timeline.Period
                      key={`${ytelse.stonadType}-${index}`}
                      start={fomDate}
                      end={tomDate}
                      status="success"
                      icon={mapYtelsestypeTilIkon(ytelse.stonadType)}
                    >
                      <p>
                        {fomFormatert} – {tomFormatert}
                      </p>
                      <p>Sum: {beløpFormatert}</p>
                    </Timeline.Period>
                  );
                })}
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

/**
 * Grupperer sammenhengende perioder som er mindre enn 45 dager fra hverandre til en enkel periode.
 * Perioder sorteres etter startdato før gruppering.
 * Beløpene for alle perioder i en gruppe summeres.
 */
function grupperSammenhengendePerioder(
  perioder: Array<{ periode: { fom: string; tom: string }; beløp: number }>,
): GruppertPeriode[] {
  if (perioder.length === 0) {
    return [];
  }

  // Sortér perioder etter startdato
  const sortertePerioder = [...perioder].sort((a, b) =>
    a.periode.fom.localeCompare(b.periode.fom),
  );

  const gruppert: GruppertPeriode[] = [];
  let nåværendeGruppe: GruppertPeriode = {
    fom: sortertePerioder[0].periode.fom,
    tom: sortertePerioder[0].periode.tom,
    totalBeløp: sortertePerioder[0].beløp,
  };

  for (let i = 1; i < sortertePerioder.length; i++) {
    const forrigeSlutt = toDate(nåværendeGruppe.tom);
    const nåværendeStart = toDate(sortertePerioder[i].periode.fom);
    const dagerMellom = differenceInDays(nåværendeStart, forrigeSlutt);

    // Hvis periodene er mindre enn 45 dager fra hverandre, utvid den nåværende gruppen
    if (dagerMellom < 45) {
      nåværendeGruppe.tom = sortertePerioder[i].periode.tom;
      nåværendeGruppe.totalBeløp += sortertePerioder[i].beløp;
    } else {
      // Ellers, lagre den nåværende gruppen og start en ny
      gruppert.push(nåværendeGruppe);
      nåværendeGruppe = {
        fom: sortertePerioder[i].periode.fom,
        tom: sortertePerioder[i].periode.tom,
        totalBeløp: sortertePerioder[i].beløp,
      };
    }
  }

  // Ikke glem å legge til den siste gruppen
  gruppert.push(nåværendeGruppe);

  return gruppert;
}

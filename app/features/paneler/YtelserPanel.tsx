import {
  Alert,
  BodyShort,
  Button,
  Link,
  Skeleton,
  Timeline,
  ToggleGroup,
  Tooltip,
} from "@navikt/ds-react";

import { useSearchParams } from "react-router";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationSquareIcon,
} from "@navikt/aksel-icons";
import {
  TimelinePeriod,
  TimelinePin,
  TimelineRow,
} from "@navikt/ds-react/Timeline";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { use, useMemo, useState } from "react";
import { RouteConfig } from "~/config/routeConfig";
import { ResolvingComponent } from "~/features/async/ResolvingComponent";
import { FeatureFlagg } from "~/features/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/features/feature-toggling/useFeatureFlagg";
import type { Ytelse } from "~/routes/oppslag/schemas";
import { sporHendelse } from "~/utils/analytics";
import { formatterDato, forskjellIDager } from "~/utils/date-utils";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const harIngenYtelser = !ytelser || ytelser.length === 0;
  const {
    nåværendeVindu,
    oppdaterVindu,
    vinduetsStørrelse,
    setVinduetsStørrelse,
  } = useTidslinjevindu();
  const tilbakekrevinger = useTilbakekrevinger(ytelser, nåværendeVindu);

  const ytelserMedGruppertePerioder = useMemo(() => {
    if (!ytelser) return [];
    return ytelser.map((ytelse) => ({
      ...ytelse,
      gruppertePerioder: grupperSammenhengendePerioder(ytelse.perioder),
    }));
  }, [ytelser]);

  const viserSiste10År = searchParams.get("utvidet") === "true";
  const tittel = viserSiste10År
    ? "Ytelser fra Nav siste 10 år"
    : "Ytelser fra Nav siste 3 år";

  return (
    <PanelContainer
      title={
        <div className="flex items-center gap-2">
          {tittel}
          <Tooltip content="Visningen er basert på utbetalinger fra Nav.">
            <InformationSquareIcon aria-hidden="true" />
          </Tooltip>
        </div>
      }
    >
      <BodyShort spacing>
        <Link
          href={`${RouteConfig.OPPSLAG}?utvidet=${!viserSiste10År}`}
          onClick={(e) => {
            e.preventDefault();
            setSearchParams((prev) => {
              prev.set("utvidet", viserSiste10År ? "false" : "true");
              return prev;
            });
          }}
        >
          Vis siste {viserSiste10År ? "3" : "10"} år
        </Link>
      </BodyShort>
      {harIngenYtelser ? (
        <Alert variant="info" className="w-fit">
          Ingen ytelser registrert de siste {viserSiste10År ? "10" : "3"} årene.
        </Alert>
      ) : (
        <>
          <TidslinjeKontrollpanel
            viserSiste10År={viserSiste10År}
            nåværendeVindu={nåværendeVindu}
            oppdaterVindu={oppdaterVindu}
            vinduetsStørrelse={vinduetsStørrelse}
            setVinduetsStørrelse={setVinduetsStørrelse}
          />

          <Timeline
            id="timeline-dynamic"
            aria-controls="timeline-toolbar"
            startDate={nåværendeVindu.start}
            endDate={nåværendeVindu.slutt}
          >
            {tilbakekrevinger.map((tilbakebetaling) => (
              <TimelinePin
                key={tilbakebetaling.info}
                date={new Date(tilbakebetaling.periode.fom)}
              >
                <BodyShort spacing>Tilbakekreving</BodyShort>
                <BodyShort spacing>
                  {formatterBeløp(tilbakebetaling.beløp)}
                </BodyShort>
                <BodyShort className="text-ax-danger-500">
                  Vedtak, Se Gosys
                </BodyShort>
              </TimelinePin>
            ))}
            {ytelserMedGruppertePerioder.map((ytelse) => {
              return (
                <TimelineRow
                  key={ytelse.stonadType}
                  label={ytelse.stonadType}
                  icon={mapYtelsestypeTilIkon(ytelse.stonadType)}
                >
                  {ytelse.gruppertePerioder.map((gruppertPeriode, index) => {
                    const fomDate = new Date(gruppertPeriode.fom);
                    const tomDate = new Date(gruppertPeriode.tom);
                    const fomFormatert = formatterDato(gruppertPeriode.fom);
                    const tomFormatert = formatterDato(gruppertPeriode.tom);
                    const beløpFormatert = formatterBeløp(
                      gruppertPeriode.totalBeløp,
                      0,
                    );

                    return (
                      <TimelinePeriod
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
                      </TimelinePeriod>
                    );
                  })}
                </TimelineRow>
              );
            })}
          </Timeline>
        </>
      )}
    </PanelContainer>
  );
};

const YtelserPanelSkeleton = () => {
  const ytelser = Array.from({ length: 3 }, (_, index) => index);
  return (
    <PanelContainerSkeleton title="Ytelser">
      <div className="flex gap-2 absolute top-4 right-4">
        <Skeleton variant="rounded" width="32px" height="32px" />
        <Skeleton variant="rounded" width="32px" height="32px" />
        <Skeleton variant="rounded" width="148px" height="32px" />
      </div>
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

type TidslinjeKontrollpanelProps = ReturnType<typeof useTidslinjevindu> & {
  viserSiste10År: boolean;
};
const TidslinjeKontrollpanel = ({
  nåværendeVindu,
  oppdaterVindu,
  vinduetsStørrelse,
  setVinduetsStørrelse,
  viserSiste10År,
}: TidslinjeKontrollpanelProps) => {
  const nå = new Date();
  const dataCutoff = new Date(nå.getTime());
  dataCutoff.setMonth(nå.getMonth() - (viserSiste10År ? 120 : 36));

  const kanFlytteForrigePeriode =
    forskjellIDager(nåværendeVindu.start, dataCutoff) >= 30;
  const kanFlytteNestePeriode = forskjellIDager(nåværendeVindu.slutt, nå) >= 30;

  return (
    <div
      className="flex justify-end items-center gap-2 mb-4 static md:absolute md:top-4 md:right-4"
      aria-controls="timeline-dynamic"
      id="timeline-toolbar"
    >
      <div className="flex gap-0.5 items-center">
        <Button
          icon={<ChevronLeftIcon title="Forrige periode" />}
          variant="secondary-neutral"
          size="small"
          disabled={!kanFlytteForrigePeriode}
          onClick={() => {
            oppdaterVindu("forrige", 1, vinduetsStørrelse);
            sporHendelse("tidslinje periode flyttet", {
              retning: "forrige",
            });
          }}
        />
        <Button
          disabled={!kanFlytteNestePeriode}
          icon={<ChevronRightIcon title="Neste periode" />}
          variant="secondary-neutral"
          size="small"
          onClick={() => {
            oppdaterVindu("neste", 1, vinduetsStørrelse);
            sporHendelse("tidslinje periode flyttet", {
              retning: "neste",
            });
          }}
        />
      </div>
      <ToggleGroup
        variant="neutral"
        size="small"
        value={vinduetsStørrelse}
        onChange={(value) => {
          const antallMåneder = value as AntallMåneder;
          setVinduetsStørrelse(antallMåneder);
          oppdaterVindu("gjeldende", 0, antallMåneder);
          sporHendelse("tidslinje størrelse endret", {
            antallMåneder,
          });
        }}
      >
        <ToggleGroupItem value="6" label="6 mnd" />
        <ToggleGroupItem value="12" label="1 år" />
        <ToggleGroupItem value="36" label="3 år" />
      </ToggleGroup>
    </div>
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
    const forrigeSlutt = new Date(nåværendeGruppe.tom);
    const nåværendeStart = new Date(sortertePerioder[i].periode.fom);
    const dagerMellom = forskjellIDager(forrigeSlutt, nåværendeStart);

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

type AntallMåneder = "6" | "12" | "36";
function useTidslinjevindu() {
  const [vinduetsStørrelse, setVinduetsStørrelse] =
    useState<AntallMåneder>("36");

  const [nåværendeVindu, setNåværendeVindu] = useState<{
    start: Date;
    slutt: Date;
  }>(() => {
    const nå = new Date();
    const start = new Date(nå);
    start.setMonth(start.getMonth() - Number(vinduetsStørrelse));
    return { start, slutt: nå };
  });

  function oppdaterVindu(
    retning: "forrige" | "neste" | "gjeldende",
    endringMåneder: number,
    vindusstørrelse: AntallMåneder,
  ) {
    const antallMåneder = parseInt(vindusstørrelse);

    if (retning === "forrige") {
      const nyStartdato = new Date(nåværendeVindu.start);
      nyStartdato.setMonth(nyStartdato.getMonth() - endringMåneder);

      const nySluttdato = new Date(nyStartdato);
      nySluttdato.setMonth(nySluttdato.getMonth() + antallMåneder);

      setNåværendeVindu({ start: nyStartdato, slutt: nySluttdato });
    } else if (retning === "neste") {
      const nyStartdato = new Date(nåværendeVindu.start);
      nyStartdato.setMonth(nyStartdato.getMonth() + endringMåneder);

      const nySluttdato = new Date(nyStartdato);
      nySluttdato.setMonth(nySluttdato.getMonth() + antallMåneder);

      setNåværendeVindu({ start: nyStartdato, slutt: nySluttdato });
    } else {
      const nyStartdato = new Date();
      nyStartdato.setMonth(nyStartdato.getMonth() - antallMåneder);

      const nySluttdato = new Date();
      setNåværendeVindu({ start: nyStartdato, slutt: nySluttdato });
    }
  }
  return {
    nåværendeVindu,
    oppdaterVindu,
    vinduetsStørrelse,
    setVinduetsStørrelse,
  };
}

/**
 * Returnerer filtrerte tilbakekrevinger innenfor valgt vindu dersom funksjonen er aktivert via feature-flagg.
 *
 * @example
 * const tilbakekrevinger = useTilbakekrevinger(ytelser, { start: new Date("2024-01-01"), slutt: new Date("2024-06-30") });
 */
function useTilbakekrevinger(
  ytelser: Ytelse[] | null,
  nåværendeVindu: { start: Date; slutt: Date },
) {
  const visTilbakebetalingIdentifikatorer = useEnkeltFeatureFlagg(
    FeatureFlagg.VIS_TILBAKEBETALING_IDENTIFIKATORER,
  );

  return useMemo(() => {
    if (!visTilbakebetalingIdentifikatorer) {
      return [];
    }

    return (
      ytelser
        ?.flatMap((ytelse) => ytelse.perioder)
        .filter(
          (periode) =>
            periode.beløp < 0 &&
            new Date(periode.periode.fom) >= nåværendeVindu.start &&
            new Date(periode.periode.tom) <= nåværendeVindu.slutt,
        ) ?? []
    );
  }, [visTilbakebetalingIdentifikatorer, ytelser, nåværendeVindu]);
}

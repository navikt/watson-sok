import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  CopyButton,
  Heading,
  Skeleton,
  Timeline,
  Tooltip,
} from "@navikt/ds-react";

import { ChevronLeftIcon, ChevronRightIcon } from "@navikt/aksel-icons";
import {
  TimelinePeriod,
  TimelinePin,
  TimelineRow,
} from "@navikt/ds-react/Timeline";
import { use, useMemo, useState } from "react";
import { sporHendelse } from "~/analytics/analytics";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { useTidsvindu } from "~/tidsvindu/Tidsvindu";
import { formaterDato, forskjellIDager } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import { YtelsedetaljerModal } from "./detaljer/YtelsedetaljerModal";
import type { Ytelse } from "./domene";
import { mapYtelsestypeTilIkon } from "./mapYtelsestypeTilIkon";
import { grupperSammenhengendePerioder } from "./utils";

type YtelserOversiktProps = {
  promise: Promise<Ytelse[] | null>;
  panelId?: string;
  ariaKeyShortcuts?: string;
};

export function YtelserPanel({
  promise,
  panelId,
  ariaKeyShortcuts,
}: YtelserOversiktProps) {
  return (
    <ResolvingComponent loadingFallback={<YtelserPanelSkeleton />}>
      <YtelserPanelMedData
        promise={promise}
        panelId={panelId}
        ariaKeyShortcuts={ariaKeyShortcuts}
      />
    </ResolvingComponent>
  );
}

type YtelserPanelMedDataProps = {
  promise: Promise<Ytelse[] | null>;
  panelId?: string;
  ariaKeyShortcuts?: string;
};
const YtelserPanelMedData = ({
  promise,
  panelId,
  ariaKeyShortcuts,
}: YtelserPanelMedDataProps) => {
  const ytelser = use(promise);
  const harIngenYtelser = !ytelser || ytelser.length === 0;
  const { nåværendeVindu, oppdaterVindu } = useTidslinjevindu();
  const tilbakekrevinger = useTilbakekrevinger(ytelser, nåværendeVindu);
  const [valgtYtelsePeriode, setValgtYtelsePeriode] = useState<{
    ytelse: Ytelse;
    fraDato: string;
    tilDato: string;
  } | null>(null);
  const { tidsvindu } = useTidsvindu();

  const ytelserMedGruppertePerioder = useMemo(() => {
    if (!ytelser) return [];
    return ytelser.map((ytelse) => ({
      ...ytelse,
      gruppertePerioder: grupperSammenhengendePerioder(ytelse.perioder),
    }));
  }, [ytelser]);

  return (
    <PanelContainer
      title="Ytelser fra Nav"
      className="overflow-x-clip"
      id={panelId}
      aria-keyshortcuts={ariaKeyShortcuts}
      onKeyDown={(e) => {
        if (e.key !== "ArrowDown" || e.target !== e.currentTarget) return;
        const førstePeriode = e.currentTarget.querySelector<HTMLButtonElement>(
          "button.aksel-timeline__period--clickable",
        );
        if (førstePeriode) {
          e.preventDefault();
          førstePeriode.focus();
        }
      }}
    >
      <BodyLong size="small">
        Visningen er basert på utbetalingstidspunkt fra Nav
      </BodyLong>
      {harIngenYtelser ? (
        <Alert variant="info" className="w-fit">
          Ingen ytelser registrert de siste {tidsvindu}.
        </Alert>
      ) : (
        <>
          <TidslinjeKontrollpanel
            nåværendeVindu={nåværendeVindu}
            oppdaterVindu={oppdaterVindu}
          />

          <div
            onKeyDownCapture={(e) => {
              const target = e.target;
              if (
                !(target instanceof HTMLButtonElement) ||
                !target.classList.contains("aksel-timeline__period--clickable")
              )
                return;

              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                e.preventDefault();
                const rad = target.closest("ol");
                if (!rad) return;
                const perioder = Array.from(
                  rad.querySelectorAll<HTMLButtonElement>(
                    "button.aksel-timeline__period--clickable",
                  ),
                );
                const idx = perioder.indexOf(target);
                const neste = e.key === "ArrowRight" ? idx + 1 : idx - 1;
                perioder[neste]?.focus();
              }
            }}
          >
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
                  <Heading level="3" size="small">
                    Tilbakekreving
                  </Heading>
                  <BodyShort spacing>
                    <strong>Periode:</strong>{" "}
                    {formaterDato(tilbakebetaling.periode.fom)} –{" "}
                    {formaterDato(tilbakebetaling.periode.tom)}
                    <br />
                    <strong>Beløp:</strong>{" "}
                    {formaterBeløp(Math.abs(tilbakebetaling.beløp))}
                    <br />
                    <span className="flex items-center gap-1">
                      <strong>Bilagsnummer:</strong>{" "}
                      {tilbakebetaling.info ?? "Ikke tilgjengelig"}{" "}
                      {tilbakebetaling.info && (
                        <CopyButton
                          copyText={tilbakebetaling.info}
                          size="xsmall"
                          className="inline-block ml-1"
                        />
                      )}
                    </span>
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
                    label={
                      <Tooltip content="Trykk for å se detaljer for alle perioder">
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => {
                            setValgtYtelsePeriode({
                              ytelse,
                              fraDato: ytelse.gruppertePerioder[0].fom,
                              tilDato:
                                ytelse.gruppertePerioder[
                                  ytelse.gruppertePerioder.length - 1
                                ].tom,
                            });
                            sporHendelse("ytelse modal åpnet", {
                              stonadType: ytelse.stonadType,
                            });
                          }}
                        >
                          <span className="inline-block max-w-[20ch] truncate">
                            {ytelse.stonadType}
                          </span>
                        </Button>
                      </Tooltip>
                    }
                  >
                    {ytelse.gruppertePerioder.map((gruppertPeriode, index) => {
                      const fomDate = new Date(gruppertPeriode.fom);
                      const tomDate = new Date(gruppertPeriode.tom);
                      const fomFormatert = formaterDato(gruppertPeriode.fom);
                      const tomFormatert = formaterDato(gruppertPeriode.tom);
                      const beløpFormatert = formaterBeløp(
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
                          onClick={(event) => {
                            event.preventDefault();
                            setValgtYtelsePeriode({
                              ytelse,
                              fraDato: gruppertPeriode.fom,
                              tilDato: gruppertPeriode.tom,
                            });
                            sporHendelse("ytelse modal åpnet", {
                              stonadType: ytelse.stonadType,
                            });
                          }}
                        >
                          <BodyShort>
                            {fomFormatert} – {tomFormatert}
                          </BodyShort>
                          <BodyShort>Sum: {beløpFormatert}</BodyShort>
                        </TimelinePeriod>
                      );
                    })}
                  </TimelineRow>
                );
              })}
            </Timeline>
          </div>
          <YtelsedetaljerModal
            ytelse={valgtYtelsePeriode?.ytelse ?? null}
            fraDato={valgtYtelsePeriode?.fraDato ?? ""}
            tilDato={valgtYtelsePeriode?.tilDato ?? ""}
            isOpen={Boolean(valgtYtelsePeriode)}
            onClose={() => setValgtYtelsePeriode(null)}
          />
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

type TidslinjeKontrollpanelProps = Pick<
  ReturnType<typeof useTidslinjevindu>,
  "nåværendeVindu" | "oppdaterVindu"
>;
const TidslinjeKontrollpanel = ({
  nåværendeVindu,
  oppdaterVindu,
}: TidslinjeKontrollpanelProps) => {
  const nå = new Date();
  const dataCutoff = new Date(nå.getTime());
  const { tidsvinduIAntallMåneder } = useTidsvindu();
  dataCutoff.setMonth(nå.getMonth() - (tidsvinduIAntallMåneder ? 120 : 36));

  const kanFlytteForrigePeriode =
    forskjellIDager(nåværendeVindu.start, dataCutoff) >= 30;
  const kanFlytteNestePeriode = forskjellIDager(nåværendeVindu.slutt, nå) >= 30;

  return (
    <div
      className="flex justify-end items-center gap-2 mb-4 static ax-md:absolute ax-md:top-4 ax-md:right-4"
      aria-controls="timeline-dynamic"
      id="timeline-toolbar"
    >
      <div className="flex gap-0.5 items-center">
        <Button
          data-color="neutral"
          aria-label="Forrige periode"
          icon={
            <Tooltip
              content={
                kanFlytteForrigePeriode
                  ? "Forrige periode"
                  : "Ingen eldre periode"
              }
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Tooltip>
          }
          variant="secondary"
          size="small"
          disabled={!kanFlytteForrigePeriode}
          onClick={() => {
            oppdaterVindu("forrige");
            sporHendelse("tidslinje periode flyttet", {
              retning: "forrige",
            });
          }}
        />
        <Button
          data-color="neutral"
          disabled={!kanFlytteNestePeriode}
          aria-label="Neste periode"
          icon={
            <Tooltip
              content={
                kanFlytteNestePeriode ? "Neste periode" : "Ingen nyere periode"
              }
            >
              <ChevronRightIcon aria-hidden="true" />
            </Tooltip>
          }
          variant="secondary"
          size="small"
          onClick={() => {
            oppdaterVindu("neste");
            sporHendelse("tidslinje periode flyttet", {
              retning: "neste",
            });
          }}
        />
      </div>
    </div>
  );
};

/**
 * Hook for å navigere i tidslinjevisningen.
 * Returnerer nåværende vindu og funksjon for å flytte frem/tilbake.
 */
function useTidslinjevindu() {
  const { tidsvinduIAntallMåneder } = useTidsvindu();
  const [tidsvinduOffset, setTidsvinduOffset] = useState(0);
  const hopp = beregnHoppForTidsvindu(tidsvinduIAntallMåneder);

  const nåværendeVindu = useMemo(
    () => beregnVindu(tidsvinduIAntallMåneder, tidsvinduOffset),
    [tidsvinduIAntallMåneder, tidsvinduOffset],
  );

  function oppdaterVindu(retning: "forrige" | "neste" | "gjeldende") {
    switch (retning) {
      case "forrige":
        setTidsvinduOffset((prev) => prev + hopp);
        break;
      case "neste":
        setTidsvinduOffset((prev) => Math.max(0, prev - hopp));
        break;
      case "gjeldende":
        setTidsvinduOffset(0);
        break;
    }
  }

  return { nåværendeVindu, oppdaterVindu };
}

/** Beregner start- og sluttdato for tidsvinduet basert på antall måneder og offset. */
function beregnVindu(tidsvinduIAntallMåneder: number, offset: number) {
  const nå = new Date();
  const start = new Date(nå);
  start.setMonth(nå.getMonth() - tidsvinduIAntallMåneder - offset);
  const slutt = new Date(nå);
  slutt.setMonth(nå.getMonth() - offset);
  return { start, slutt };
}

/**
 * Beregner hvor mange måneder vi skal hoppe frem/tilbake i tidslinjen basert på tidsvinduets størrelse.
 * Større tidsvindu gir større hopp for bedre navigering.
 */
function beregnHoppForTidsvindu(tidsvinduIAntallMåneder: number): number {
  switch (tidsvinduIAntallMåneder) {
    case 120:
      return 12;
    case 36:
      return 6;
    case 12:
      return 3;
    default:
      return 1;
  }
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
  return useMemo(() => {
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
  }, [ytelser, nåværendeVindu]);
}

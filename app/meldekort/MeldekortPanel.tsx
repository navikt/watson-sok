import { ChevronLeftIcon, ChevronRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Skeleton,
  Table,
  ToggleGroup,
  Tooltip,
} from "@navikt/ds-react";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { use, useEffect, useMemo, useState } from "react";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { formaterDato } from "~/utils/date-utils";
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
        <MeldekortVisning meldekort={meldekort} />
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

const AKTIVITET_TYPER = ["Arbeid", "Fravaer", "Syk", "Utdanning"] as const;
type AktivitetType = (typeof AKTIVITET_TYPER)[number];

const TIMER_FORMAT = new Intl.NumberFormat("nb-NO", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function sorterDager(
  dager: MeldekortRespons[number]["dager"],
): MeldekortRespons[number]["dager"] {
  return [...dager].sort((a, b) => a.dagIndex - b.dagIndex);
}

function formaterAktiviteter(
  aktiviteter: MeldekortRespons[number]["dager"][number]["aktiviteter"],
) {
  if (aktiviteter.length === 0) {
    return "–";
  }

  const oppsummering = AKTIVITET_TYPER.map((type) => {
    const aktiviteterForType = aktiviteter.filter(
      (aktivitet) => aktivitet.type === type,
    );

    if (aktiviteterForType.length === 0) {
      return null;
    }

    const navn = mapAktivitetstype(type);
    const manglerTimer = aktiviteterForType.some(
      (aktivitet) => aktivitet.timer == null,
    );

    if (manglerTimer) {
      return navn;
    }

    const sum = aktiviteterForType.reduce(
      (total, aktivitet) => total + (aktivitet.timer ?? 0),
      0,
    );

    return `${navn} ${TIMER_FORMAT.format(sum)} t`;
  }).filter(Boolean);

  if (oppsummering.length === 0) {
    return "–";
  }

  return oppsummering.join(", ");
}

function mapAktivitetstype(type: AktivitetType) {
  switch (type) {
    case "Fravaer":
      return "Fravær";
    default:
      return type;
  }
}

type MeldekortTabellProps = {
  meldekort: MeldekortRespons;
};

type MeldekortVisning = "tabell" | "stolpe";

const MeldekortVisning = ({ meldekort }: MeldekortTabellProps) => {
  const sorterteMeldekort = useMemo(
    () =>
      [...meldekort].sort((a, b) =>
        b.periode.fraOgMed.localeCompare(a.periode.fraOgMed),
      ),
    [meldekort],
  );
  const [aktivtIndex, setAktivtIndex] = useState(0);

  useEffect(() => {
    setAktivtIndex(0);
  }, [sorterteMeldekort.length]);

  const aktivtMeldekort = sorterteMeldekort[aktivtIndex];
  const kanGåTilForrige = aktivtIndex < sorterteMeldekort.length - 1;
  const kanGåTilNeste = aktivtIndex > 0;
  const [visning, setVisning] = useState<MeldekortVisning>("tabell");

  return (
    <div className="flex flex-col gap-3 max-w-[50%]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Heading level="3" size="small">
            Periode {formaterDato(aktivtMeldekort.periode.fraOgMed)} –{" "}
            {formaterDato(aktivtMeldekort.periode.tilOgMed)}
          </Heading>
          <BodyShort size="small">Meldekort-ID: {aktivtMeldekort.id}</BodyShort>
          {aktivtMeldekort.meldedato && (
            <BodyShort size="small">
              Meldedato: {formaterDato(aktivtMeldekort.meldedato)}
            </BodyShort>
          )}
          {sorterteMeldekort.length > 1 && (
            <BodyShort size="small">
              Viser {aktivtIndex + 1} av {sorterteMeldekort.length}
            </BodyShort>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ToggleGroup
            variant="neutral"
            size="small"
            value={visning}
            aria-label="Velg visning"
            onChange={(value) => setVisning(value as MeldekortVisning)}
          >
            <ToggleGroupItem value="tabell" label="Tabell" />
            <ToggleGroupItem value="stolpe" label="Stolper" />
          </ToggleGroup>
          <div className="flex items-center gap-0.5">
            <Button
              icon={<ChevronLeftIcon title="Forrige meldekort" />}
              variant="secondary-neutral"
              size="small"
              disabled={!kanGåTilForrige}
              onClick={() => setAktivtIndex((index) => index + 1)}
            />
            <Button
              icon={<ChevronRightIcon title="Neste meldekort" />}
              variant="secondary-neutral"
              size="small"
              disabled={!kanGåTilNeste}
              onClick={() => setAktivtIndex((index) => index - 1)}
            />
          </div>
        </div>
      </div>
      {visning === "tabell" ? (
        <MeldekortTabellVisning meldekort={aktivtMeldekort} />
      ) : (
        <MeldekortStolpediagram dager={aktivtMeldekort.dager} />
      )}
    </div>
  );
};

type MeldekortTabellVisningProps = {
  meldekort: MeldekortRespons[number];
};

const MeldekortTabellVisning = ({ meldekort }: MeldekortTabellVisningProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Table size="small" zebraStripes>
        <TableHeader>
          <TableRow>
            <TableHeaderCell scope="col" textSize="small">
              Dato
            </TableHeaderCell>
            <TableHeaderCell scope="col" textSize="small">
              Aktivitet
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorterDager(meldekort.dager).map((dag) => (
            <TableRow key={`${meldekort.id}-${dag.dagIndex}`}>
              <TableHeaderCell scope="row" textSize="small">
                {formaterDato(dag.dato)}
              </TableHeaderCell>
              <TableDataCell textSize="small">
                {formaterAktiviteter(dag.aktiviteter)}
              </TableDataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <BodyShort size="small">
        Aktiviteter uten timer vises uten timeangivelse.
      </BodyShort>
    </div>
  );
};

type MeldekortStolpediagramProps = {
  dager: MeldekortRespons[number]["dager"];
};

const MELDEKORT_GRAF_BREDDE = 720;
const MELDEKORT_GRAF_HØYDE = 220;
const MELDEKORT_GRAF_PADDING = {
  top: 16,
  right: 16,
  bottom: 32,
  left: 36,
} as const;

const AKTIVITET_FARGER: Record<
  AktivitetType,
  { fill: string; stroke: string }
> = {
  Arbeid: {
    fill: "var(--ax-success-200)",
    stroke: "var(--ax-success-600)",
  },
  Fravaer: {
    fill: "var(--ax-warning-300)",
    stroke: "var(--ax-warning-600)",
  },
  Syk: {
    fill: "var(--ax-danger-200)",
    stroke: "var(--ax-danger-600)",
  },
  Utdanning: {
    fill: "var(--ax-warning-200)",
    stroke: "var(--ax-warning-500)",
  },
};

const KORT_DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});
const STANDARD_TIMER_VED_MANGLER = 7.5;

const MeldekortStolpediagram = ({ dager }: MeldekortStolpediagramProps) => {
  const sorterteDager = sorterDager(dager);
  const grafData = sorterteDager.map((dag) => {
    const { summer, harManglendeTimer } = summerAktiviteter(dag.aktiviteter);
    const total = AKTIVITET_TYPER.reduce((sum, type) => sum + summer[type], 0);

    return {
      dato: dag.dato,
      summer,
      total,
      harManglendeTimer,
    };
  });

  const maksVerdi = Math.max(...grafData.map((dag) => dag.total), 0);
  const harOppgitteTimer = maksVerdi > 0;
  const harManglendeTimer = grafData.some((dag) => dag.harManglendeTimer);

  if (!harOppgitteTimer) {
    return (
      <div className="flex flex-col gap-2">
        <Alert variant="info">Ingen oppgitte timer i perioden.</Alert>
        {harManglendeTimer && (
          <BodyShort size="small">
            Timer mangler for én eller flere aktiviteter. Viser 7,5 t som
            standard.
          </BodyShort>
        )}
      </div>
    );
  }

  const grafBredde =
    MELDEKORT_GRAF_BREDDE -
    MELDEKORT_GRAF_PADDING.left -
    MELDEKORT_GRAF_PADDING.right;
  const grafHøyde =
    MELDEKORT_GRAF_HØYDE -
    MELDEKORT_GRAF_PADDING.top -
    MELDEKORT_GRAF_PADDING.bottom;
  const xScale = (index: number) =>
    MELDEKORT_GRAF_PADDING.left +
    (index / (grafData.length - 1 || 1)) * grafBredde;
  const yScale = (verdi: number) =>
    MELDEKORT_GRAF_PADDING.top + grafHøyde - (verdi / maksVerdi) * grafHøyde;
  const barWidth = Math.min(
    28,
    Math.max(10, grafBredde / grafData.length / 1.6),
  );
  const radius = Math.min(4, barWidth / 3);
  const gridLinjer = [0.25, 0.5, 0.75, 1].map((faktor) => ({
    verdi: maksVerdi * faktor,
    y: yScale(maksVerdi * faktor),
  }));

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${MELDEKORT_GRAF_BREDDE} ${MELDEKORT_GRAF_HØYDE}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto min-h-[220px]"
          role="img"
          aria-labelledby="meldekort-stolpe-tittel"
          aria-describedby="meldekort-stolpe-beskrivelse"
        >
          <title id="meldekort-stolpe-tittel">
            Stolpediagram over registrerte timer per dag
          </title>
          <desc id="meldekort-stolpe-beskrivelse">
            Viser summerte timer per aktivitetstype for hver dag i perioden. Se
            tabellen for detaljer.
          </desc>

          <g aria-hidden="true">
            {gridLinjer.map((grid, index) => (
              <g key={index}>
                <line
                  x1={MELDEKORT_GRAF_PADDING.left}
                  y1={grid.y}
                  x2={MELDEKORT_GRAF_PADDING.left + grafBredde}
                  y2={grid.y}
                  stroke="var(--ax-neutral-300)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={MELDEKORT_GRAF_PADDING.left - 8}
                  y={grid.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--ax-text-default)"
                >
                  {TIMER_FORMAT.format(grid.verdi)}
                </text>
              </g>
            ))}
          </g>

          <g aria-hidden="true">
            <line
              x1={MELDEKORT_GRAF_PADDING.left}
              y1={MELDEKORT_GRAF_PADDING.top + grafHøyde}
              x2={MELDEKORT_GRAF_PADDING.left + grafBredde}
              y2={MELDEKORT_GRAF_PADDING.top + grafHøyde}
              stroke="var(--ax-neutral-600)"
              strokeWidth="1"
            />
            {grafData.map((dag, index) => {
              if (index % 2 !== 0) {
                return null;
              }
              return (
                <text
                  key={dag.dato}
                  x={xScale(index)}
                  y={MELDEKORT_GRAF_PADDING.top + grafHøyde + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--ax-text-default)"
                >
                  {formaterKortDato(dag.dato)}
                </text>
              );
            })}
          </g>

          <g aria-hidden="true">
            <line
              x1={MELDEKORT_GRAF_PADDING.left}
              y1={MELDEKORT_GRAF_PADDING.top}
              x2={MELDEKORT_GRAF_PADDING.left}
              y2={MELDEKORT_GRAF_PADDING.top + grafHøyde}
              stroke="var(--ax-neutral-600)"
              strokeWidth="1"
            />
          </g>

          {grafData.map((dag, index) => {
            const xCenter = xScale(index);
            let currentY = MELDEKORT_GRAF_PADDING.top + grafHøyde;
            const segmenter = AKTIVITET_TYPER.map((type) => ({
              type,
              verdi: dag.summer[type],
            })).filter((segment) => segment.verdi > 0);
            const toppIndex = segmenter.length - 1;

            return (
              <g key={dag.dato}>
                {segmenter.map((segment, segmentIndex) => {
                  const høyde = (segment.verdi / maksVerdi) * grafHøyde;
                  currentY -= høyde;
                  const x = xCenter - barWidth / 2;
                  const farger = AKTIVITET_FARGER[segment.type];
                  const key = `${dag.dato}-${segment.type}`;
                  const tooltipInnhold = `${mapAktivitetstype(
                    segment.type,
                  )} ${TIMER_FORMAT.format(segment.verdi)} t`;

                  if (segmentIndex === toppIndex) {
                    return (
                      <Tooltip key={key} content={tooltipInnhold}>
                        <path
                          d={lagTopprundetPath(
                            x,
                            currentY,
                            barWidth,
                            høyde,
                            radius,
                          )}
                          fill={farger.fill}
                          stroke={farger.stroke}
                          strokeWidth="1"
                          style={{ cursor: "pointer" }}
                        />
                      </Tooltip>
                    );
                  }

                  return (
                    <Tooltip key={key} content={tooltipInnhold}>
                      <rect
                        x={x}
                        y={currentY}
                        width={barWidth}
                        height={høyde}
                        fill={farger.fill}
                        stroke={farger.stroke}
                        strokeWidth="1"
                        style={{ cursor: "pointer" }}
                      />
                    </Tooltip>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4">
        {AKTIVITET_TYPER.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{
                backgroundColor: AKTIVITET_FARGER[type].fill,
                border: `1px solid ${AKTIVITET_FARGER[type].stroke}`,
              }}
            />
            <BodyShort size="small">{mapAktivitetstype(type)}</BodyShort>
          </div>
        ))}
      </div>
      {harManglendeTimer && (
        <BodyShort size="small">
          Timer mangler for én eller flere aktiviteter. Viser 7,5 t som
          standard.
        </BodyShort>
      )}
    </div>
  );
};

function formaterKortDato(isoDato: string) {
  try {
    return KORT_DATO_FORMAT.format(new Date(isoDato));
  } catch {
    return isoDato;
  }
}

function summerAktiviteter(
  aktiviteter: MeldekortRespons[number]["dager"][number]["aktiviteter"],
) {
  const summer = {
    Arbeid: 0,
    Fravaer: 0,
    Syk: 0,
    Utdanning: 0,
  };
  let harManglendeTimer = false;

  for (const aktivitet of aktiviteter) {
    if (!AKTIVITET_TYPER.includes(aktivitet.type)) {
      continue;
    }
    if (aktivitet.timer == null) {
      harManglendeTimer = true;
      summer[aktivitet.type] += STANDARD_TIMER_VED_MANGLER;
      continue;
    }
    summer[aktivitet.type] += aktivitet.timer;
  }

  return { summer, harManglendeTimer };
}

function lagTopprundetPath(
  x: number,
  y: number,
  bredde: number,
  høyde: number,
  r: number,
) {
  const effektivR = Math.min(r, bredde / 2, høyde);
  const høyreX = x + bredde;
  const bunnY = y + høyde;

  return [
    `M ${x} ${bunnY}`,
    `L ${x} ${y + effektivR}`,
    `Q ${x} ${y} ${x + effektivR} ${y}`,
    `L ${høyreX - effektivR} ${y}`,
    `Q ${høyreX} ${y} ${høyreX} ${y + effektivR}`,
    `L ${høyreX} ${bunnY}`,
    "Z",
  ].join(" ");
}

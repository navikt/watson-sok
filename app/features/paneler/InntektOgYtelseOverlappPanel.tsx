import {
  Alert,
  BodyShort,
  Heading,
  Skeleton,
  ToggleGroup,
} from "@navikt/ds-react";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { use, useMemo, useState } from "react";
import type { InntektInformasjon, Ytelse } from "~/routes/oppslag/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import { formatterBeløp, konverterTilTall } from "~/utils/number-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type InntektOgYtelseOverlappPanelProps = {
  inntektPromise: Promise<InntektInformasjon | null>;
  ytelserPromise: Promise<Ytelse[] | null>;
};

type MånedligData = {
  periode: string; // "YYYY-MM"
  inntekt: number;
  ytelse: number;
};

type GrafFarger = {
  inntektLinje: string;
  inntektPunkt: string;
  ytelseLinje: string;
  ytelsePunkt: string;
  inntektStolpeFill: string;
  inntektStolpeStroke: string;
  ytelseStolpeFill: string;
  ytelseStolpeStroke: string;
};

const ANTALL_MÅNEDER_BACK = 36; // 3 år, samme som InntektPanel

/**
 * Transformerer inntekter og ytelser til månedlige aggregater for de siste 36 månedene.
 *
 * @example
 * const data = transformTilMånedligData(inntektInformasjon, ytelser);
 * // [{ periode: "2024-01", inntekt: 50000, ytelse: 0 }, ...]
 */
function transformTilMånedligData(
  inntektInformasjon: InntektInformasjon | null,
  ytelser: Ytelse[] | null,
): MånedligData[] {
  const nå = new Date();
  const cutoff = new Date(
    nå.getFullYear(),
    nå.getMonth() - ANTALL_MÅNEDER_BACK,
    1,
  );

  // Initialiser alle måneder med 0
  const månedligData = new Map<string, { inntekt: number; ytelse: number }>();

  // Legg til alle måneder i perioden
  for (let i = 0; i <= ANTALL_MÅNEDER_BACK; i++) {
    const måned = new Date(nå.getFullYear(), nå.getMonth() - i, 1);
    const periodeKey = `${måned.getFullYear()}-${String(måned.getMonth() + 1).padStart(2, "0")}`;
    månedligData.set(periodeKey, { inntekt: 0, ytelse: 0 });
  }

  // Aggreger inntekter
  if (inntektInformasjon?.lønnsinntekt) {
    inntektInformasjon.lønnsinntekt.forEach((rad) => {
      const beløp = konverterTilTall(rad.beløp);
      if (beløp === null) {
        return;
      }

      const periode = rad.periode?.substring(0, 7);
      if (!periode) {
        return;
      }

      const dato = new Date(`${periode}-01`);
      if (Number.isNaN(dato.getTime()) || dato < cutoff) {
        return;
      }

      const eksisterende = månedligData.get(periode);
      if (eksisterende) {
        eksisterende.inntekt += beløp;
      }
    });
  }

  // Aggreger ytelser
  if (ytelser) {
    ytelser.forEach((ytelse) => {
      ytelse.perioder.forEach((periode) => {
        const beløp = konverterTilTall(periode.beløp);
        if (beløp === null) {
          return;
        }

        // Bruk fom-datoen for å bestemme måned
        const fomDato = new Date(periode.periode.fom);
        if (Number.isNaN(fomDato.getTime()) || fomDato < cutoff) {
          return;
        }

        const periodeKey = `${fomDato.getFullYear()}-${String(fomDato.getMonth() + 1).padStart(2, "0")}`;
        const eksisterende = månedligData.get(periodeKey);
        if (eksisterende) {
          eksisterende.ytelse += beløp;
        }
      });
    });
  }

  // Konverter til array og sorter
  return Array.from(månedligData.entries())
    .map(([periode, data]) => ({
      periode,
      inntekt: data.inntekt,
      ytelse: data.ytelse,
    }))
    .sort((a, b) => a.periode.localeCompare(b.periode));
}

export function InntektOgYtelseOverlappPanel({
  inntektPromise,
  ytelserPromise,
}: InntektOgYtelseOverlappPanelProps) {
  return (
    <ResolvingComponent
      loadingFallback={<InntektOgYtelseOverlappPanelSkeleton />}
    >
      <InntektOgYtelseOverlappPanelMedData
        inntektPromise={inntektPromise}
        ytelserPromise={ytelserPromise}
      />
    </ResolvingComponent>
  );
}

type InntektOgYtelseOverlappPanelMedDataProps = {
  inntektPromise: Promise<InntektInformasjon | null>;
  ytelserPromise: Promise<Ytelse[] | null>;
};

const InntektOgYtelseOverlappPanelMedData = ({
  inntektPromise,
  ytelserPromise,
}: InntektOgYtelseOverlappPanelMedDataProps) => {
  const inntektInformasjon = use(inntektPromise);
  const ytelser = use(ytelserPromise);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [grafVisning, setGrafVisning] = useState<"linje" | "stolpe">("linje");

  const månedligData = useMemo(
    () => transformTilMånedligData(inntektInformasjon, ytelser),
    [inntektInformasjon, ytelser],
  );

  const grafData = useMemo(() => {
    if (månedligData.length === 0) {
      return null;
    }

    // Filtrer bort måneder uten data (men behold måneder med minst én verdi > 0)
    const dataMedVerdier = månedligData.filter(
      (d) => d.inntekt !== 0 || d.ytelse !== 0,
    );

    if (dataMedVerdier.length === 0) {
      return null;
    }

    // Finn maks-verdier for skalering
    const maksInntekt = Math.max(...månedligData.map((d) => d.inntekt), 0);
    const maksYtelse = Math.max(...månedligData.map((d) => d.ytelse), 0);
    const maksTotal = Math.max(
      ...månedligData.map((d) => d.inntekt + d.ytelse),
      0,
    );
    const maksVerdi = Math.max(maksInntekt, maksYtelse, maksTotal, 1);

    // Bruk alle måneder for sammenhengende linjer, ikke bare de med verdier
    return {
      data: månedligData,
      maksVerdi,
    };
  }, [månedligData]);

  const erTom = !grafData || grafData.data.length === 0;

  return (
    <PanelContainer
      title={<>Inntekt og ytelses&shy;utbetalinger over tid</>}
      isBeta
    >
      {erTom ? (
        <Alert variant="info">
          Ingen inntekter eller ytelser funnet for de siste{" "}
          {ANTALL_MÅNEDER_BACK} månedene.
        </Alert>
      ) : (
        <div className="mt-4">
          <div className="flex justify-end absolute top-4 right-4">
            <ToggleGroup
              variant="neutral"
              size="small"
              value={grafVisning}
              aria-label="Velg grafvisning"
              onChange={(value) => setGrafVisning(value as typeof grafVisning)}
            >
              <ToggleGroupItem value="linje" label="Linjer" />
              <ToggleGroupItem value="stolpe" label="Stolper" />
            </ToggleGroup>
          </div>
          {grafVisning === "linje" ? (
            <Linjegraf
              data={grafData.data}
              maksVerdi={grafData.maksVerdi}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          ) : (
            <Stolpediagram
              data={grafData.data}
              maksVerdi={grafData.maksVerdi}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          <HoverInfoboks data={grafData.data} hoveredIndex={hoveredIndex} />
          <GrafLegende />
          <SkjultTabell data={grafData.data} />
        </div>
      )}
    </PanelContainer>
  );
};

const STANDARD_FARGER: GrafFarger = {
  inntektLinje: "var(--ax-bg-brand-blue-strong)",
  inntektPunkt: "var(--ax-bg-brand-blue-strong-hover)",
  ytelseLinje: "var(--ax-bg-brand-beige-strong)",
  ytelsePunkt: "var(--ax-bg-brand-beige-strong-hover)",
  inntektStolpeFill: "var(--ax-bg-brand-blue-moderate)",
  inntektStolpeStroke: "var(--ax-bg-brand-blue-strong)",
  ytelseStolpeFill: "var(--ax-bg-brand-beige-moderate)",
  ytelseStolpeStroke: "var(--ax-bg-brand-beige-strong)",
} as const;

const AKSE_OPPSETT = {
  padding: { top: 20, right: 20, bottom: 40, left: 60 },
  høyde: 240,
  bredde: 800,
  antallGridLinjer: 5,
  minLabelAvstand: 55,
} as const;

const {
  padding: PADDING,
  høyde: GRAF_HØYDE,
  bredde: GRAF_BREDDE,
  antallGridLinjer: ANTALL_GRID_LINJER,
  minLabelAvstand: MIN_LABEL_AVSTAND,
} = AKSE_OPPSETT;

function lagGridLinjer(maksVerdi: number, yScale: (verdi: number) => number) {
  return Array.from({ length: ANTALL_GRID_LINJER }, (_, i) => {
    const verdi =
      (maksVerdi / (ANTALL_GRID_LINJER - 1)) * (ANTALL_GRID_LINJER - 1 - i);
    const avrundetVerdi = Math.round(verdi / 1000) * 1000;
    const y = yScale(verdi);
    return { verdi, avrundetVerdi, y };
  });
}

function lagXLabels(
  data: MånedligData[],
  xScale: (index: number) => number,
  minAvstand: number = MIN_LABEL_AVSTAND,
) {
  const xLabels = data
    .map((d, index) => ({ d, index }))
    .filter(
      ({ index }) =>
        index % Math.ceil(data.length / 8) === 0 || index === data.length - 1,
    )
    .map(({ d, index }) => ({ ...d, originalIndex: index, x: xScale(index) }));

  if (xLabels.length < 2) {
    return xLabels;
  }

  const xLabelsMedPlass = xLabels.filter((label, idx, arr) => {
    if (idx !== arr.length - 1) {
      return true;
    }

    const nestSiste = arr[arr.length - 2];
    return label.x - nestSiste.x >= minAvstand;
  });

  return xLabelsMedPlass;
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

function lagHoverHandlers(
  onHover: (index: number | null) => void,
  index: number,
) {
  return {
    onEnter: () => onHover(index),
    onLeave: () => onHover(null),
  };
}

type LinjegrafProps = {
  data: MånedligData[];
  maksVerdi: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
};

/**
 * Komponent som viser en SVG-linjegraf med inntekter og ytelser over tid.
 * Grafen er responsiv og tilgjengelig for skjermlesere.
 */
function Linjegraf({ data, maksVerdi, hoveredIndex, onHover }: LinjegrafProps) {
  const grafBredde = GRAF_BREDDE - PADDING.left - PADDING.right;
  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;

  // Beregn x-posisjoner (tid)
  const xScale = (index: number) =>
    PADDING.left + (index / (data.length - 1 || 1)) * grafBredde;

  // Beregn y-posisjoner (beløp)
  const yScale = (verdi: number) =>
    PADDING.top + grafHøyde - (verdi / maksVerdi) * grafHøyde;

  // Generer path-data for linjene
  const inntektPath = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.inntekt);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  const ytelsePath = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.ytelse);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  // Generer grid-linjer og y-akse labels
  const gridLinjer = lagGridLinjer(maksVerdi, yScale);

  // X-akse labels (vis hver 6. måned for å unngå overfylt)
  const xLabelsMedPlass = lagXLabels(data, xScale);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${GRAF_BREDDE} ${GRAF_HØYDE}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto min-h-[300px]"
        role="img"
        aria-labelledby="graf-tittel"
        aria-describedby="graf-beskrivelse"
      >
        <title id="graf-tittel">
          Linjegraf over inntekter og ytelses&nbsp;utbetalinger over tid
        </title>
        <desc id="graf-beskrivelse">
          Grafen viser månedlige inntekter og ytelser de siste{" "}
          {ANTALL_MÅNEDER_BACK} månedene. Se tabellen nedenfor for nøyaktige
          verdier.
        </desc>

        {/* Grid-linjer */}
        <g aria-hidden="true">
          {gridLinjer.map((grid, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={grid.y}
                x2={PADDING.left + grafBredde}
                y2={grid.y}
                stroke="var(--ax-neutral-300)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 10}
                y={grid.y + 4}
                textAnchor="end"
                fontSize="10"
              >
                {formatterBeløp(grid.avrundetVerdi, 0)}
              </text>
            </g>
          ))}
        </g>

        {/* X-akse */}
        <g aria-hidden="true">
          <line
            x1={PADDING.left}
            y1={PADDING.top + grafHøyde}
            x2={PADDING.left + grafBredde}
            y2={PADDING.top + grafHøyde}
            stroke="var(--ax-neutral-600)"
            strokeWidth="1"
          />
          {xLabelsMedPlass.map((label) => (
            <g key={label.periode}>
              <text
                x={label.x}
                y={PADDING.top + grafHøyde + 20}
                textAnchor="middle"
                fontSize="10"
                fill="var(--ax-text-default)"
              >
                {formatÅrMåned(label.periode)}
              </text>
            </g>
          ))}
        </g>

        {/* Y-akse */}
        <g aria-hidden="true">
          <line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={PADDING.top + grafHøyde}
            stroke="var(--ax-neutral-600)"
            strokeWidth="1"
          />
        </g>

        {/* Inntekt-linje - tegnes først så punktene er på toppen */}
        <path
          d={inntektPath}
          fill="none"
          stroke={STANDARD_FARGER.inntektLinje}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Inntekter"
        />

        {/* Ytelse-linje */}
        <path
          d={ytelsePath}
          fill="none"
          stroke={STANDARD_FARGER.ytelseLinje}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Ytelser"
        />

        {/* Data-punkter og hover-områder */}
        {data.map((d, i) => {
          const x = xScale(i);
          const inntektY = yScale(d.inntekt);
          const ytelseY = yScale(d.ytelse);
          const isHovered = hoveredIndex === i;
          const { onEnter, onLeave } = lagHoverHandlers(onHover, i);

          return (
            <g key={d.periode}>
              {/* Hover-område (usynlig, men større for bedre UX) */}
              <rect
                x={x - 15}
                y={PADDING.top}
                width="30"
                height={grafHøyde}
                fill="transparent"
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                style={{ cursor: "pointer" }}
              />

              {/* Inntekt-punkt - vis alltid, men mindre når verdi er 0 */}
              {d.inntekt > 0 && (
                <circle
                  cx={x}
                  cy={inntektY}
                  r={isHovered ? 3 : 2}
                  fill={STANDARD_FARGER.inntektPunkt}
                  stroke="white"
                  strokeWidth={1}
                  aria-label={`Inntekt ${formatÅrMåned(d.periode)}: ${formatterBeløp(d.inntekt)}`}
                />
              )}

              {/* Ytelse-punkt - vis alltid, men mindre når verdi er 0 */}
              {d.ytelse > 0 && (
                <circle
                  cx={x}
                  cy={ytelseY}
                  r={isHovered ? 3 : 2}
                  fill={STANDARD_FARGER.ytelsePunkt}
                  stroke="white"
                  strokeWidth={1}
                  aria-label={`Ytelse ${formatÅrMåned(d.periode)}: ${formatterBeløp(d.ytelse)}`}
                />
              )}

              {/* Tooltip ved hover */}
              {isHovered && (
                <line
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={PADDING.top + grafHøyde}
                  stroke="var(--ax-neutral-400)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type StolpediagramProps = {
  data: MånedligData[];
  maksVerdi: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
};

/**
 * Viser et stacked stolpediagram med inntekt nederst og ytelse øverst.
 */
function Stolpediagram({
  data,
  maksVerdi,
  hoveredIndex,
  onHover,
}: StolpediagramProps) {
  const grafBredde = GRAF_BREDDE - PADDING.left - PADDING.right;
  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;
  const xScale = (index: number) =>
    PADDING.left + (index / (data.length - 1 || 1)) * grafBredde;
  const yScale = (verdi: number) =>
    PADDING.top + grafHøyde - (verdi / maksVerdi) * grafHøyde;

  const barWidth = Math.min(32, Math.max(12, grafBredde / data.length / 1.5));
  const radius = Math.min(4, barWidth / 3);
  const gridLinjer = lagGridLinjer(maksVerdi, yScale);
  const xLabelsMedPlass = lagXLabels(data, xScale);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${GRAF_BREDDE} ${GRAF_HØYDE}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto min-h-[300px]"
        role="img"
        aria-labelledby="stolpe-graf-tittel"
        aria-describedby="stolpe-graf-beskrivelse"
      >
        <title id="stolpe-graf-tittel">
          Stolpediagram over inntekter og ytelser over tid
        </title>
        <desc id="stolpe-graf-beskrivelse">
          Viser inntekter som nederste del av stolpen og ytelser på toppen. Se
          tabellen nedenfor for nøyaktige verdier.
        </desc>

        <g aria-hidden="true">
          {gridLinjer.map((grid, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={grid.y}
                x2={PADDING.left + grafBredde}
                y2={grid.y}
                stroke="var(--ax-neutral-300)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 10}
                y={grid.y + 4}
                textAnchor="end"
                fontSize="10"
              >
                {formatterBeløp(grid.avrundetVerdi, 0)}
              </text>
            </g>
          ))}
        </g>

        <g aria-hidden="true">
          <line
            x1={PADDING.left}
            y1={PADDING.top + grafHøyde}
            x2={PADDING.left + grafBredde}
            y2={PADDING.top + grafHøyde}
            stroke="var(--ax-neutral-600)"
            strokeWidth="1"
          />
          {xLabelsMedPlass.map((label) => (
            <g key={label.periode}>
              <text
                x={label.x}
                y={PADDING.top + grafHøyde + 20}
                textAnchor="middle"
                fontSize="10"
                fill="var(--ax-text-default)"
              >
                {formatÅrMåned(label.periode)}
              </text>
            </g>
          ))}
        </g>

        <g aria-hidden="true">
          <line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={PADDING.top + grafHøyde}
            stroke="var(--ax-neutral-600)"
            strokeWidth="1"
          />
        </g>

        {data.map((d, i) => {
          const xCenter = xScale(i);
          const inntektHøyde = (d.inntekt / maksVerdi) * grafHøyde;
          const ytelseHøyde = (d.ytelse / maksVerdi) * grafHøyde;
          const baseY = PADDING.top + grafHøyde;
          const isHovered = hoveredIndex === i;
          const { onEnter, onLeave } = lagHoverHandlers(onHover, i);

          return (
            <g key={d.periode}>
              <rect
                x={xCenter - barWidth / 2}
                y={PADDING.top}
                width={barWidth}
                height={grafHøyde}
                fill="transparent"
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                style={{ cursor: "pointer" }}
              />

              {d.inntekt > 0 &&
                (d.ytelse > 0 ? (
                  <rect
                    x={xCenter - barWidth / 2}
                    y={baseY - inntektHøyde}
                    width={barWidth}
                    height={inntektHøyde}
                    fill={STANDARD_FARGER.inntektStolpeFill}
                    stroke={STANDARD_FARGER.inntektStolpeStroke}
                    strokeWidth="1"
                    aria-label={`Inntekt ${formatÅrMåned(d.periode)}: ${formatterBeløp(d.inntekt)}`}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  />
                ) : (
                  <path
                    d={lagTopprundetPath(
                      xCenter - barWidth / 2,
                      baseY - inntektHøyde,
                      barWidth,
                      inntektHøyde,
                      radius,
                    )}
                    fill={STANDARD_FARGER.inntektStolpeFill}
                    stroke={STANDARD_FARGER.inntektStolpeStroke}
                    strokeWidth="1"
                    aria-label={`Inntekt ${formatÅrMåned(d.periode)}: ${formatterBeløp(d.inntekt)}`}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  />
                ))}
              {d.ytelse > 0 && (
                <path
                  d={lagTopprundetPath(
                    xCenter - barWidth / 2,
                    baseY - inntektHøyde - ytelseHøyde,
                    barWidth,
                    ytelseHøyde,
                    radius,
                  )}
                  fill={STANDARD_FARGER.ytelseStolpeFill}
                  stroke={STANDARD_FARGER.ytelseStolpeStroke}
                  strokeWidth="1"
                  aria-label={`Ytelse ${formatÅrMåned(d.periode)}: ${formatterBeløp(d.ytelse)}`}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                />
              )}

              {isHovered && (
                <line
                  x1={xCenter}
                  y1={PADDING.top}
                  x2={xCenter}
                  y2={PADDING.top + grafHøyde}
                  stroke="var(--ax-neutral-400)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type HoverInfoboksProps = {
  data: MånedligData[];
  hoveredIndex: number | null;
};

function HoverInfoboks({ data, hoveredIndex }: HoverInfoboksProps) {
  const valgt = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div
      className="mt-3 rounded-md border border-ax-neutral-200 bg-ax-bg-default px-4 py-3"
      aria-live="polite"
      aria-label="Detaljer om valgt måned"
    >
      {valgt ? (
        <BodyShort size="small" className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">{formatÅrMåned(valgt.periode)}</span>
          <span aria-label="Inntekt denne måneden">
            Inntekt: {formatterBeløp(valgt.inntekt)}
          </span>
          <span aria-label="Ytelser denne måneden">
            Ytelse: {formatterBeløp(valgt.ytelse)}
          </span>
        </BodyShort>
      ) : (
        <BodyShort size="small">
          Hold markøren over et punkt i grafen for detaljer.
        </BodyShort>
      )}
    </div>
  );
}

/**
 * Komponent som viser en legende for grafen.
 */
function GrafLegende() {
  return (
    <div
      className="flex items-center justify-center gap-6 mt-4"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: STANDARD_FARGER.inntektLinje }}
        />
        <BodyShort size="small">Inntekter</BodyShort>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: STANDARD_FARGER.ytelseLinje }}
        />
        <BodyShort size="small">Ytelser</BodyShort>
      </div>
    </div>
  );
}

/**
 * Skjult tabell med data for skjermlesere.
 * Dette gir tilgang til nøyaktige verdier for brukere som ikke kan se grafen.
 */
function SkjultTabell({ data }: { data: MånedligData[] }) {
  return (
    <div className="sr-only">
      <Heading level="3" size="small">
        Månedlige inntekter og ytelser
      </Heading>
      <table>
        <thead>
          <tr>
            <th>Periode</th>
            <th>Inntekt</th>
            <th>Ytelse</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.periode}>
              <td>{formatÅrMåned(d.periode)}</td>
              <td>{formatterBeløp(d.inntekt)}</td>
              <td>{formatterBeløp(d.ytelse)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const InntektOgYtelseOverlappPanelSkeleton = () => (
  <PanelContainerSkeleton
    title="Inntekt og ytelser over tid"
    link={{ href: "#", beskrivelse: "Placeholder" }}
  >
    <Skeleton
      variant="rounded"
      width="100%"
      height={`${GRAF_HØYDE}px`}
      className="mb-4"
    />
    <Skeleton variant="rounded" width="100%" height="40px" className="mb-4" />
    <div className="flex justify-center gap-2">
      <Skeleton variant="rounded" width="20px" height="20px" />
      <Skeleton variant="text" width="70px" height="20px" className="mr-4" />
      <Skeleton variant="rounded" width="20px" height="20px" />
      <Skeleton variant="text" width="70px" height="20px" />
    </div>
  </PanelContainerSkeleton>
);

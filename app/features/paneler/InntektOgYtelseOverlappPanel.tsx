import { Alert, BodyShort, Heading, Skeleton } from "@navikt/ds-react";
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
    const maksVerdi = Math.max(maksInntekt, maksYtelse, 1);

    // Bruk alle måneder for sammenhengende linjer, ikke bare de med verdier
    return {
      data: månedligData,
      maksVerdi,
    };
  }, [månedligData]);

  const erTom = !grafData || grafData.data.length === 0;

  return (
    <PanelContainer title="Inntekt og ytelsesutbetalinger over tid" isBeta>
      {erTom ? (
        <Alert variant="info">
          Ingen inntekter eller ytelser funnet for de siste{" "}
          {ANTALL_MÅNEDER_BACK} månedene.
        </Alert>
      ) : (
        <div className="mt-4">
          <Linjegraf
            data={grafData.data}
            maksVerdi={grafData.maksVerdi}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
          />
          <HoverInfoboks data={grafData.data} hoveredIndex={hoveredIndex} />
          <GrafLegende />
          <SkjultTabell data={grafData.data} />
        </div>
      )}
    </PanelContainer>
  );
};

type LinjegrafProps = {
  data: MånedligData[];
  maksVerdi: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
};

const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
const GRAF_HØYDE = 240;
const GRAF_BREDDE = 800;

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
  const antallGridLinjer = 5;
  const gridLinjer = Array.from({ length: antallGridLinjer }, (_, i) => {
    const verdi =
      (maksVerdi / (antallGridLinjer - 1)) * (antallGridLinjer - 1 - i);
    const avrundetVerdi = Math.round(verdi / 1000) * 1000;
    const y = yScale(verdi);
    return { verdi, avrundetVerdi, y };
  });

  // X-akse labels (vis hver 6. måned for å unngå overfylt)
  const xLabels = data
    .map((d, index) => ({ d, index }))
    .filter(
      ({ index }) =>
        index % Math.ceil(data.length / 8) === 0 || index === data.length - 1,
    )
    .map(({ d, index }) => ({ ...d, originalIndex: index, x: xScale(index) }));

  const minLabelAvstand = 55;
  const xLabelsMedPlass = xLabels.filter((label, idx, arr) => {
    if (idx !== arr.length - 1 || arr.length < 2) {
      return true;
    }

    const nestSiste = arr[arr.length - 2];
    return label.x - nestSiste.x >= minLabelAvstand;
  });

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
                fontSize="11"
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
                fontSize="11"
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
          stroke="var(--ax-bg-meta-purple-strong)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Inntekter"
        />

        {/* Ytelse-linje */}
        <path
          d={ytelsePath}
          fill="none"
          stroke="var(--ax-bg-meta-lime-strong)"
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

          return (
            <g key={d.periode}>
              {/* Hover-område (usynlig, men større for bedre UX) */}
              <rect
                x={x - 15}
                y={PADDING.top}
                width="30"
                height={grafHøyde}
                fill="transparent"
                onMouseEnter={() => onHover(i)}
                onMouseLeave={() => onHover(null)}
                style={{ cursor: "pointer" }}
              />

              {/* Inntekt-punkt - vis alltid, men mindre når verdi er 0 */}
              {d.inntekt > 0 && (
                <circle
                  cx={x}
                  cy={inntektY}
                  r={isHovered ? 3 : 2}
                  fill="var(--ax-bg-meta-purple-strong-hover)"
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
                  fill="var(--ax-bg-meta-lime-strong-hover)"
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
        <div className="w-4 h-4 rounded-full bg-ax-bg-meta-purple-strong" />
        <BodyShort size="small">Inntekter</BodyShort>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-ax-bg-meta-lime-strong" />
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
  <PanelContainerSkeleton title="Inntekt og ytelser over tid">
    <Skeleton variant="rounded" width="100%" height={`${GRAF_HØYDE}px`} />
  </PanelContainerSkeleton>
);

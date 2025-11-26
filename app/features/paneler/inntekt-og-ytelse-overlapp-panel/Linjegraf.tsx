import { formatÅrMåned } from "~/utils/date-utils";
import { formatterBeløp } from "~/utils/number-utils";
import {
  ANTALL_MÅNEDER_BACK,
  GRAF_BREDDE,
  GRAF_HØYDE,
  PADDING,
  STANDARD_FARGER,
} from "./konstanter";
import type { MånedligData } from "./typer";
import { lagGridLinjer, lagHoverHandlers, lagXLabels } from "./utils";

type LinjegrafProps = {
  data: MånedligData[];
  maksVerdi: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
};

/**
 * Viser en SVG-linjegraf med inntekter og ytelser over tid.
 *
 * @example
 * <Linjegraf data={data} maksVerdi={100000} hoveredIndex={null} onHover={() => {}} />
 */
export function Linjegraf({
  data,
  maksVerdi,
  hoveredIndex,
  onHover,
}: LinjegrafProps) {
  const grafBredde = GRAF_BREDDE - PADDING.left - PADDING.right;
  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;

  const xScale = (index: number) =>
    PADDING.left + (index / (data.length - 1 || 1)) * grafBredde;

  const yScale = (verdi: number) =>
    PADDING.top + grafHøyde - (verdi / maksVerdi) * grafHøyde;

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

  const gridLinjer = lagGridLinjer(maksVerdi, yScale);
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

        <path
          d={inntektPath}
          fill="none"
          stroke={STANDARD_FARGER.inntektLinje}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={ytelsePath}
          fill="none"
          stroke={STANDARD_FARGER.ytelseLinje}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => {
          const x = xScale(i);
          const inntektY = yScale(d.inntekt);
          const ytelseY = yScale(d.ytelse);
          const isHovered = hoveredIndex === i;
          const { onEnter, onLeave } = lagHoverHandlers(onHover, i);

          return (
            <g key={d.periode}>
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

              {d.inntekt > 0 && (
                <circle
                  cx={x}
                  cy={inntektY}
                  r={isHovered ? 3 : 2}
                  fill={STANDARD_FARGER.inntektPunkt}
                  stroke="white"
                  strokeWidth={1}
                />
              )}

              {d.ytelse > 0 && (
                <circle
                  cx={x}
                  cy={ytelseY}
                  r={isHovered ? 3 : 2}
                  fill={STANDARD_FARGER.ytelsePunkt}
                  stroke="white"
                  strokeWidth={1}
                />
              )}

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

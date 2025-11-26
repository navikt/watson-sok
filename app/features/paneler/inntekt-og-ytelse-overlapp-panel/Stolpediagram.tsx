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
import {
  lagGridLinjer,
  lagHoverHandlers,
  lagTopprundetPath,
  lagXLabels,
} from "./utils";

type StolpediagramProps = {
  data: MånedligData[];
  maksVerdi: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
};

/**
 * Viser et stacked stolpediagram med inntekt nederst og ytelse øverst.
 *
 * @example
 * <Stolpediagram data={data} maksVerdi={75000} hoveredIndex={0} onHover={() => {}} />
 */
export function Stolpediagram({
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
          tabellen nedenfor for nøyaktige verdier for de siste{" "}
          {ANTALL_MÅNEDER_BACK} månedene.
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

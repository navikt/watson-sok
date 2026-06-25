import { formaterÅrMåned } from "~/utils/date-utils";
import {
  lagTopprundetPath,
  lagXLabels,
} from "~/inntekt-og-ytelse/inntekt-og-ytelse-overlapp-panel/utils";
import {
  GRAF_BREDDE,
  GRAF_HØYDE,
  PADDING,
} from "~/inntekt-og-ytelse/inntekt-og-ytelse-overlapp-panel/konstanter";

import type { TimerPerMåned } from "./utils";

const AA_FARGE = "var(--ax-bg-brand-blue-strong)";
const AA_FARGE_STROKE = "var(--ax-bg-brand-blue-strong-hover)";
const MK_FARGE = "var(--ax-bg-brand-beige-strong)";
const MK_FARGE_STROKE = "var(--ax-bg-brand-beige-strong-hover)";
const BAR_MELLOMROM = 2;
const RADIUS = 3;
const ANTALL_GRID_LINJER = 5;

type Props = {
  data: TimerPerMåned[];
};

/**
 * Stolpediagram (side-by-side) som viser AA-registrerte timer og meldekort-timer per måned.
 * Måneder med avvik på mer enn 20 % markeres med en advarsel.
 */
export function TimerSammenligningGraf({ data }: Props) {
  if (data.length === 0) return null;

  const grafBredde = GRAF_BREDDE - PADDING.left - PADDING.right;
  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;

  const maksTimer = Math.max(
    ...data.flatMap((d) => [d.mkTimer, d.aaTimer]),
    40,
  );

  const xScale = (i: number) =>
    PADDING.left + (i / Math.max(data.length - 1, 1)) * grafBredde;

  const yScale = (v: number) =>
    PADDING.top + grafHøyde - (v / maksTimer) * grafHøyde;

  const gridLinjer = Array.from({ length: ANTALL_GRID_LINJER }, (_, i) => {
    const verdi =
      (maksTimer / (ANTALL_GRID_LINJER - 1)) * (ANTALL_GRID_LINJER - 1 - i);
    return { verdi: Math.round(verdi), y: yScale(verdi) };
  });

  const xLabelsMedPlass = lagXLabels(
    data.map((d) => ({ periode: d.måned, inntekt: 0, ytelse: 0 })),
    xScale,
  );

  const barGroupWidth = Math.min(
    40,
    Math.max(14, grafBredde / data.length / 1.8),
  );
  const barWidth = (barGroupWidth - BAR_MELLOMROM) / 2;
  const baseY = PADDING.top + grafHøyde;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 text-sm" role="note">
        <span className="flex items-center gap-2">
          <svg width="16" height="12" aria-hidden="true">
            <rect x="0" y="0" width="16" height="12" rx="2" fill={AA_FARGE} />
          </svg>
          AA-registrerte timer
        </span>
        <span className="flex items-center gap-2">
          <svg width="16" height="12" aria-hidden="true">
            <rect x="0" y="0" width="16" height="12" rx="2" fill={MK_FARGE} />
          </svg>
          Meldekort-timer
        </span>
        {data.some((d) => d.harAvvik) && (
          <span className="flex items-center gap-1">⚠️ Avvik oppdaget</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${GRAF_BREDDE} ${GRAF_HØYDE}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto min-h-[240px]"
          role="img"
          aria-label="Stolpediagram som sammenligner AA-registrerte timer og meldekort-timer per måned"
        >
          <g aria-hidden="true">
            {gridLinjer.map((grid) => (
              <g key={grid.verdi}>
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
                  x={PADDING.left - 8}
                  y={grid.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--ax-text-default)"
                >
                  {grid.verdi}t
                </text>
              </g>
            ))}
          </g>

          <line
            x1={PADDING.left}
            y1={baseY}
            x2={PADDING.left + grafBredde}
            y2={baseY}
            stroke="var(--ax-neutral-600)"
            strokeWidth="1"
            aria-hidden="true"
          />

          <g aria-hidden="true">
            {xLabelsMedPlass.map((label) => (
              <text
                key={label.periode}
                x={label.x}
                y={baseY + 18}
                textAnchor="middle"
                fontSize="10"
                fill="var(--ax-text-default)"
              >
                {formaterÅrMåned(label.periode)}
              </text>
            ))}
          </g>

          <line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={baseY}
            stroke="var(--ax-neutral-600)"
            strokeWidth="1"
            aria-hidden="true"
          />

          {data.map((d, i) => {
            const xCenter = xScale(i);
            const aaBarX = xCenter - barGroupWidth / 2;
            const mkBarX = aaBarX + barWidth + BAR_MELLOMROM;
            const aaHøyde = (d.aaTimer / maksTimer) * grafHøyde;
            const mkHøyde = (d.mkTimer / maksTimer) * grafHøyde;
            const avvikY = Math.min(baseY - aaHøyde, baseY - mkHøyde) - 10;

            return (
              <g
                key={d.måned}
                aria-label={`${formaterÅrMåned(d.måned)}: AA ${Math.round(d.aaTimer)}t, MK ${Math.round(d.mkTimer)}t`}
              >
                {d.aaTimer > 0 && (
                  <path
                    d={lagTopprundetPath(
                      aaBarX,
                      baseY - aaHøyde,
                      barWidth,
                      aaHøyde,
                      RADIUS,
                    )}
                    fill={AA_FARGE}
                    stroke={AA_FARGE_STROKE}
                    strokeWidth="1"
                  />
                )}
                {d.mkTimer > 0 && (
                  <path
                    d={lagTopprundetPath(
                      mkBarX,
                      baseY - mkHøyde,
                      barWidth,
                      mkHøyde,
                      RADIUS,
                    )}
                    fill={MK_FARGE}
                    stroke={MK_FARGE_STROKE}
                    strokeWidth="1"
                  />
                )}
                {d.harAvvik && (
                  <text
                    x={xCenter}
                    y={avvikY}
                    textAnchor="middle"
                    fontSize="13"
                    aria-label={`Avvik i ${formaterÅrMåned(d.måned)}`}
                  >
                    ⚠️
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

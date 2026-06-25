import { formaterÅrMåned } from "~/utils/date-utils";

import type { TimerPerMåned } from "./utils";

const GRAF_BREDDE = 800;
const GRAF_HØYDE = 240;
const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
const ANTALL_GRID_LINJER = 5;
const MINIMUM_MAKSTIMER = 40;

type Props = {
  data: TimerPerMåned[];
};

/**
 * Linjegraf som viser AA-registrerte timer og meldekort-timer per måned.
 * Måneder med avvik på mer enn 20 % markeres med en advarsel.
 */
export function TimerSammenligningGraf({ data }: Props) {
  if (data.length === 0) return null;

  const grafBredde = GRAF_BREDDE - PADDING.left - PADDING.right;
  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;

  const maksTimer = Math.max(
    ...data.flatMap((d) => [d.mkTimer, d.aaTimer]),
    MINIMUM_MAKSTIMER,
  );

  const xScale = (i: number) =>
    PADDING.left + (i / Math.max(data.length - 1, 1)) * grafBredde;

  const yScale = (v: number) =>
    PADDING.top + grafHøyde - (v / maksTimer) * grafHøyde;

  const lagSti = (getter: (d: TimerPerMåned) => number) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(getter(d))}`)
      .join(" ");

  const gridLinjer = Array.from({ length: ANTALL_GRID_LINJER }, (_, i) => {
    const verdi = (maksTimer * (i + 1)) / ANTALL_GRID_LINJER;
    return { verdi: Math.round(verdi), y: yScale(verdi) };
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex gap-4 text-sm"
        aria-label="Grafforklaring"
        role="note"
      >
        <span className="flex items-center gap-2">
          <svg width="24" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="24"
              y2="2"
              stroke="var(--ax-bg-brand-blue-strong)"
              strokeWidth="2"
            />
          </svg>
          AA-registrerte timer
        </span>
        <span className="flex items-center gap-2">
          <svg width="24" height="4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="24"
              y2="2"
              stroke="var(--ax-bg-brand-beige-strong)"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          </svg>
          Meldekort-timer
        </span>
        {data.some((d) => d.harAvvik) && (
          <span className="flex items-center gap-1" aria-live="polite">
            ⚠️ Avvik mellom AA-timer og meldekort-timer
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${GRAF_BREDDE} ${GRAF_HØYDE}`}
        className="w-full"
        role="img"
        aria-label="Linjegraf som sammenligner AA-registrerte timer og meldekort-timer per måned"
      >
        {/* Gridlinjer og Y-akse-etiketter */}
        {gridLinjer.map((linje) => (
          <g key={linje.verdi}>
            <line
              x1={PADDING.left}
              x2={GRAF_BREDDE - PADDING.right}
              y1={linje.y}
              y2={linje.y}
              stroke="var(--ax-border-neutral-subtle)"
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 6}
              y={linje.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="var(--ax-text-neutral-subtle)"
            >
              {linje.verdi}t
            </text>
          </g>
        ))}

        {/* X-akse-etiketter */}
        {data.map((d, i) => (
          <text
            key={d.måned}
            x={xScale(i)}
            y={GRAF_HØYDE - PADDING.bottom / 2}
            textAnchor="middle"
            fontSize="11"
            fill="var(--ax-text-neutral-subtle)"
          >
            {formaterÅrMåned(d.måned)}
          </text>
        ))}

        {/* AA-timer-linje */}
        <path
          d={lagSti((d) => d.aaTimer)}
          fill="none"
          stroke="var(--ax-bg-brand-blue-strong)"
          strokeWidth="2"
        />

        {/* MK-timer-linje (stiplet) */}
        <path
          d={lagSti((d) => d.mkTimer)}
          fill="none"
          stroke="var(--ax-bg-brand-beige-strong)"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        {/* Datapunkter */}
        {data.map((d, i) => (
          <g key={d.måned}>
            <circle
              cx={xScale(i)}
              cy={yScale(d.aaTimer)}
              r="3"
              fill="var(--ax-bg-brand-blue-strong)"
            />
            <circle
              cx={xScale(i)}
              cy={yScale(d.mkTimer)}
              r="3"
              fill="var(--ax-bg-brand-beige-strong)"
            />
          </g>
        ))}

        {/* Avviksmarkering */}
        {data.map((d, i) =>
          d.harAvvik ? (
            <text
              key={`avvik-${d.måned}`}
              x={xScale(i)}
              y={Math.min(yScale(d.mkTimer), yScale(d.aaTimer)) - 8}
              textAnchor="middle"
              fontSize="14"
              aria-label={`Avvik i ${formaterÅrMåned(d.måned)}`}
            >
              ⚠️
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

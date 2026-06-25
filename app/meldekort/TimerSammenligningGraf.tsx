import { formaterÅrMåned } from "~/utils/date-utils";
import type { TimerPerMåned } from "./utils";

const AA_FARGE = "var(--ax-bg-brand-blue-strong)";
const MK_FARGE = "var(--ax-bg-brand-green-strong)";
const AVVIK_FARGE = "var(--ax-text-warning)";
const ANTALL_GRID_LINJER = 5;
const SLOT_BREDDE = 52;
const BAR_MELLOMROM = 4;
const BAR_RADIUS = 3;
const PADDING = { top: 36, right: 16, bottom: 52, left: 52 };
const GRAF_HØYDE = 280;

type Props = {
  data: TimerPerMåned[];
};

function topprundetRektangel(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  if (h <= 0) return "";
  const rEff = Math.min(r, h / 2, w / 2);
  return [
    `M ${x + rEff} ${y}`,
    `H ${x + w - rEff}`,
    `Q ${x + w} ${y} ${x + w} ${y + rEff}`,
    `V ${y + h}`,
    `H ${x}`,
    `V ${y + rEff}`,
    `Q ${x} ${y} ${x + rEff} ${y}`,
    "Z",
  ].join(" ");
}

/**
 * Stolpediagram (side-by-side) som viser AA-registrerte timer og meldekort-timer per måned.
 * Måneder med avvik på mer enn 20 % markeres med advarsel over søylene.
 */
export function TimerSammenligningGraf({ data }: Props) {
  if (data.length === 0) return null;

  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;
  const barWidth = (SLOT_BREDDE - BAR_MELLOMROM * 3) / 2;
  const totalBredde = data.length * SLOT_BREDDE + PADDING.left + PADDING.right;
  const baseY = PADDING.top + grafHøyde;

  const maksTimer = Math.max(...data.flatMap((d) => [d.mkTimer, d.aaTimer]), 20);
  const gridTopp = Math.ceil(maksTimer / 10) * 10;

  const yScale = (v: number) =>
    PADDING.top + grafHøyde - (v / gridTopp) * grafHøyde;

  const gridLinjer = Array.from({ length: ANTALL_GRID_LINJER }, (_, i) => {
    const verdi = (gridTopp / (ANTALL_GRID_LINJER - 1)) * i;
    return { verdi: Math.round(verdi), y: yScale(verdi) };
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-wrap gap-x-6 gap-y-1 text-sm items-center"
        role="note"
      >
        <span className="flex items-center gap-2">
          <svg width="14" height="14" aria-hidden="true">
            <rect width="14" height="14" rx="2" fill={AA_FARGE} />
          </svg>
          <span>AA-registrerte timer</span>
        </span>
        <span className="flex items-center gap-2">
          <svg width="14" height="14" aria-hidden="true">
            <rect width="14" height="14" rx="2" fill={MK_FARGE} />
          </svg>
          <span>Meldekort-timer</span>
        </span>
        {data.some((d) => d.harAvvik) && (
          <span className="flex items-center gap-1 text-[var(--ax-text-warning)]">
            <span aria-hidden>▲</span>
            <span>Avvik ≥ 20 %</span>
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalBredde} ${GRAF_HØYDE}`}
          width={Math.max(totalBredde, 400)}
          height={GRAF_HØYDE}
          role="img"
          aria-label="Stolpediagram som sammenligner AA-registrerte timer og meldekort-timer per måned"
        >
          <g aria-hidden="true">
            {gridLinjer.map((grid) => (
              <g key={grid.verdi}>
                <line
                  x1={PADDING.left}
                  y1={grid.y}
                  x2={totalBredde - PADDING.right}
                  y2={grid.y}
                  stroke="var(--ax-border-neutral-subtle)"
                  strokeWidth="1"
                  strokeDasharray={grid.verdi === 0 ? "none" : "4 4"}
                />
                <text
                  x={PADDING.left - 6}
                  y={grid.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--ax-text-subtle)"
                >
                  {grid.verdi}t
                </text>
              </g>
            ))}
          </g>

          <line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={baseY}
            stroke="var(--ax-border-neutral)"
            strokeWidth="1"
            aria-hidden="true"
          />

          {data.map((d, i) => {
            const slotX = PADDING.left + i * SLOT_BREDDE;
            const aaBarX = slotX + BAR_MELLOMROM;
            const mkBarX = aaBarX + barWidth + BAR_MELLOMROM;
            const aaHøyde = Math.max(0, (d.aaTimer / gridTopp) * grafHøyde);
            const mkHøyde = Math.max(0, (d.mkTimer / gridTopp) * grafHøyde);
            const labelX = slotX + SLOT_BREDDE / 2;
            const måned = formaterÅrMåned(d.måned);
            const [månedNavn, år] = måned.split(" ");

            return (
              <g
                key={d.måned}
                aria-label={`${måned}: AA ${Math.round(d.aaTimer)}t, MK ${Math.round(d.mkTimer)}t`}
              >
                {d.harAvvik && (
                  <text
                    x={labelX}
                    y={Math.min(baseY - aaHøyde, baseY - mkHøyde) - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fill={AVVIK_FARGE}
                    fontWeight="bold"
                    aria-label={`Avvik i ${måned}`}
                  >
                    ▲
                  </text>
                )}

                {aaHøyde > 0 && (
                  <path
                    d={topprundetRektangel(
                      aaBarX,
                      baseY - aaHøyde,
                      barWidth,
                      aaHøyde,
                      BAR_RADIUS,
                    )}
                    fill={AA_FARGE}
                    opacity="0.9"
                  />
                )}

                {mkHøyde > 0 && (
                  <path
                    d={topprundetRektangel(
                      mkBarX,
                      baseY - mkHøyde,
                      barWidth,
                      mkHøyde,
                      BAR_RADIUS,
                    )}
                    fill={MK_FARGE}
                    opacity="0.9"
                  />
                )}

                <text
                  x={labelX}
                  y={baseY + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--ax-text-subtle)"
                >
                  {månedNavn}
                </text>
                {år && (
                  <text
                    x={labelX}
                    y={baseY + 32}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--ax-text-subtle)"
                    opacity="0.7"
                  >
                    {år}
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

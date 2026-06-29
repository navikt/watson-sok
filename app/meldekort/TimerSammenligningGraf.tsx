import type { TimerPerMåned } from "./utils";

const AA_FARGE = "var(--ax-brand-blue-800)";
const MK_FARGE = "var(--ax-warning-500)";
const AVVIK_HIGHLIGHT = "var(--ax-warning-200)";
const ANTALL_GRID_LINJER = 5;
const SLOT_BREDDE = 52;
const BAR_MELLOMROM = 4;
const BAR_RADIUS = 2;
const PADDING = { top: 40, right: 16, bottom: 52, left: 48 };
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

function formaterMånedEtikett(måned: string, forrige?: string): string {
  // måned format: "2025-06"
  const [år, mndNum] = måned.split("-");
  const måneder = [
    "jan",
    "feb",
    "mar",
    "apr",
    "mai",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "des",
  ];
  const mndNavn = måneder[parseInt(mndNum) - 1];
  // Vis år kun på første måned i nytt år (eller første i serien)
  if (!forrige || forrige.split("-")[0] !== år) {
    return `${mndNavn} ${år.slice(2)}`;
  }
  return mndNavn;
}

/**
 * Stolpediagram som sammenligner AA-registrerte timer (arbeidsgiver) og
 * meldekort-timer (bruker) per måned. Måneder med avvik markeres med
 * avvik-verdi og gul kolonnebakgrunn.
 */
export function TimerSammenligningGraf({ data }: Props) {
  if (data.length === 0) return null;

  const grafHøyde = GRAF_HØYDE - PADDING.top - PADDING.bottom;
  const barWidth = (SLOT_BREDDE - BAR_MELLOMROM * 3) / 2;
  const totalBredde = data.length * SLOT_BREDDE + PADDING.left + PADDING.right;
  const baseY = PADDING.top + grafHøyde;

  const maksTimer = Math.max(
    ...data.flatMap((d) => [d.mkTimer, d.aaTimer]),
    20,
  );
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
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Stolpediagram — horisontal scroll"
      >
        <svg
          viewBox={`0 0 ${totalBredde} ${GRAF_HØYDE}`}
          width={Math.max(totalBredde, 400)}
          height={GRAF_HØYDE}
          role="group"
          aria-label="Stolpediagram som sammenligner AA-registrerte timer og meldekort-timer per måned"
        >
          {/* Gul bakgrunn for avvik-kolonner */}
          {data.map((d, i) => {
            if (!d.harAvvik) return null;
            const slotX = PADDING.left + i * SLOT_BREDDE;
            return (
              <rect
                key={`avvik-bg-${d.måned}`}
                x={slotX}
                y={PADDING.top}
                width={SLOT_BREDDE}
                height={grafHøyde}
                fill={AVVIK_HIGHLIGHT}
                aria-hidden="true"
              />
            );
          })}

          {/* Grid-linjer */}
          <g aria-hidden="true">
            {gridLinjer.map((grid) => (
              <g key={grid.verdi}>
                {grid.verdi > 0 && (
                  <line
                    x1={PADDING.left}
                    y1={grid.y}
                    x2={totalBredde - PADDING.right}
                    y2={grid.y}
                    stroke="var(--ax-border-neutral-subtle)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )}
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

          {/* Bunnlinje */}
          <line
            x1={PADDING.left}
            y1={baseY}
            x2={totalBredde - PADDING.right}
            y2={baseY}
            stroke="var(--ax-border-neutral)"
            strokeWidth="1"
            aria-hidden="true"
          />

          {/* Søyler + etiketter */}
          {data.map((d, i) => {
            const slotX = PADDING.left + i * SLOT_BREDDE;
            const aaBarX = slotX + BAR_MELLOMROM;
            const mkBarX = aaBarX + barWidth + BAR_MELLOMROM;
            const aaHøyde = Math.max(0, (d.aaTimer / gridTopp) * grafHøyde);
            const mkHøyde = Math.max(0, (d.mkTimer / gridTopp) * grafHøyde);
            const labelX = slotX + SLOT_BREDDE / 2;
            const etikett = formaterMånedEtikett(d.måned, data[i - 1]?.måned);
            const avvikVerdi = Math.round(d.aaTimer - d.mkTimer);

            return (
              <g
                key={d.måned}
                role="img"
                aria-label={`${etikett}: AA ${Math.round(d.aaTimer)}t, MK ${Math.round(d.mkTimer)}t${d.harAvvik ? `, avvik ${avvikVerdi}t` : ""}`}
              >
                {/* Avvik-markering med ikon og verdi */}
                {d.harAvvik &&
                  (() => {
                    const ikonStørrelse = 14;
                    const ikonSkala = ikonStørrelse / 24;
                    const markerY =
                      Math.min(baseY - aaHøyde, baseY - mkHøyde) -
                      ikonStørrelse -
                      6;
                    const ikonX = labelX - ikonStørrelse - 2;
                    return (
                      <g fill={MK_FARGE}>
                        {/* ExclamationmarkTriangleFillIcon — Aksel SVG path (24x24 viewBox) */}
                        <g
                          transform={`translate(${ikonX}, ${markerY}) scale(${ikonSkala})`}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2.25a.75.75 0 0 1 .656.387l9.527 17.25A.75.75 0 0 1 21.526 21H2.474a.75.75 0 0 1-.657-1.113l9.526-17.25A.75.75 0 0 1 12 2.25M12 8.75a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75m-1 7.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0"
                          />
                        </g>
                        <text
                          x={ikonX + ikonStørrelse + 3}
                          y={markerY + ikonStørrelse - 2}
                          fontSize="10"
                          fontWeight="600"
                        >
                          {avvikVerdi > 0
                            ? `▲ ${avvikVerdi}`
                            : `▼ ${Math.abs(avvikVerdi)}`}
                        </text>
                      </g>
                    );
                  })()}

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
                  />
                )}

                {/* X-akse etikett */}
                <text
                  x={labelX}
                  y={baseY + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--ax-text-subtle)"
                >
                  {etikett}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-sm" role="note">
        <span className="flex items-center gap-2">
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="6" fill={AA_FARGE} />
          </svg>
          AA-timer (arbeidsgiver)
        </span>
        <span className="flex items-center gap-2">
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="6" fill={MK_FARGE} />
          </svg>
          Meldekort-timer (bruker)
        </span>
      </div>
    </div>
  );
}

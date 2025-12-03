import { useMemo } from "react";
import { useTidsvindu } from "~/features/tidsvindu/Tidsvindu";
import { konverterTilTall } from "~/utils/number-utils";
import { ANTALL_GRID_LINJER, MIN_LABEL_AVSTAND } from "./konstanter";
import type {
  GridLinje,
  HoverHandler,
  InntektOgYtelseOverlappPanelProps,
  MånedligData,
  XLabel,
} from "./typer";

/**
 * Hook som returnerer memoisert månedlig data basert på inntektinformasjon,
 * ytelser og valgt tidsvindu.
 */
export function useMånedligData(
  inntektInformasjon: Awaited<
    InntektOgYtelseOverlappPanelProps["inntektPromise"]
  >,
  ytelser: Awaited<InntektOgYtelseOverlappPanelProps["ytelserPromise"]>,
) {
  const { tidsvinduIAntallMåneder } = useTidsvindu();
  return useMemo(() => {
    return transformTilMånedligData(
      inntektInformasjon,
      ytelser,
      tidsvinduIAntallMåneder,
    );
  }, [inntektInformasjon, ytelser, tidsvinduIAntallMåneder]);
}

/**
 * Transformerer inntekter og ytelser til månedlige aggregater for de siste 36 månedene.
 *
 * @example
 * const data = transformTilMånedligData(inntektInformasjon, ytelser);
 * // data[0] kan være { periode: "2024-01", inntekt: 50000, ytelse: 0 }
 */
function transformTilMånedligData(
  inntektInformasjon: Awaited<
    InntektOgYtelseOverlappPanelProps["inntektPromise"]
  >,
  ytelser: Awaited<InntektOgYtelseOverlappPanelProps["ytelserPromise"]>,
  antallMånederBack: number,
): MånedligData[] {
  const nå = new Date();
  const cutoff = new Date(
    nå.getFullYear(),
    nå.getMonth() - antallMånederBack,
    1,
  );

  const månedligData = new Map<string, { inntekt: number; ytelse: number }>();

  for (let i = 0; i <= antallMånederBack; i++) {
    const måned = new Date(nå.getFullYear(), nå.getMonth() - i, 1);
    const periodeKey = `${måned.getFullYear()}-${String(måned.getMonth() + 1).padStart(2, "0")}`;
    månedligData.set(periodeKey, { inntekt: 0, ytelse: 0 });
  }

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

  if (ytelser) {
    ytelser.forEach((ytelse) => {
      ytelse.perioder.forEach((periode) => {
        const beløp = konverterTilTall(periode.beløp);
        if (beløp === null) {
          return;
        }

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

  return Array.from(månedligData.entries())
    .map(([periode, data]) => ({
      periode,
      inntekt: data.inntekt,
      ytelse: data.ytelse,
    }))
    .sort((a, b) => a.periode.localeCompare(b.periode));
}

/**
 * Lager jevnt fordelte grid-linjer for y-aksen basert på maksverdi.
 *
 * @example
 * const linjer = lagGridLinjer(10000, (verdi) => 200 - verdi / 100);
 * // linjer[0] kan være { verdi: 10000, avrundetVerdi: 10000, y: 100 }
 */
export function lagGridLinjer(
  maksVerdi: number,
  yScale: (verdi: number) => number,
): GridLinje[] {
  return Array.from({ length: ANTALL_GRID_LINJER }, (_, i) => {
    const verdi =
      (maksVerdi / (ANTALL_GRID_LINJER - 1)) * (ANTALL_GRID_LINJER - 1 - i);
    const avrundetVerdi = Math.round(verdi / 1000) * 1000;
    const y = yScale(verdi);
    return { verdi, avrundetVerdi, y };
  });
}

/**
 * Lager etiketter på x-aksen med minimum avstand slik at de ikke overlapper.
 *
 * @example
 * const labels = lagXLabels(data, (i) => i * 20);
 * // labels[0] kan være { periode: "2024-01", originalIndex: 0, x: 0, inntekt: 1000, ytelse: 0 }
 */
export function lagXLabels(
  data: MånedligData[],
  xScale: (index: number) => number,
  minAvstand: number = MIN_LABEL_AVSTAND,
): XLabel[] {
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

  return xLabels.filter((label, idx, arr) => {
    if (idx !== arr.length - 1) {
      return true;
    }

    const nestSiste = arr[arr.length - 2];
    return label.x - nestSiste.x >= minAvstand;
  });
}

/**
 * Lager en path-kommando for en stolpe med avrundet topp.
 *
 * @example
 * const path = lagTopprundetPath(10, 20, 30, 100, 4);
 * // Gir en SVG-path streng som kan brukes direkte på en <path>-tag.
 */
export function lagTopprundetPath(
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

/**
 * Lager hover-håndtere som kan gjenbrukes på ulike SVG-elementer.
 *
 * @example
 * const { onEnter, onLeave } = lagHoverHandlers(setIndex, 3);
 * <rect onMouseEnter={onEnter} onMouseLeave={onLeave} />
 */
export function lagHoverHandlers(
  onHover: (index: number | null) => void,
  index: number,
): HoverHandler {
  return {
    onEnter: () => onHover(index),
    onLeave: () => onHover(null),
  };
}

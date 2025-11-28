import type { GrafFarger } from "./typer";

export const ANTALL_MÅNEDER_BACK = 36; // 3 år, samme som InntektPanel

export const STANDARD_FARGER: GrafFarger = {
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

export const {
  padding: PADDING,
  høyde: GRAF_HØYDE,
  bredde: GRAF_BREDDE,
  antallGridLinjer: ANTALL_GRID_LINJER,
  minLabelAvstand: MIN_LABEL_AVSTAND,
} = AKSE_OPPSETT;

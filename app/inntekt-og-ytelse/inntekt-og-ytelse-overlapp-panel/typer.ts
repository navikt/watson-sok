import type { InntektInformasjon } from "~/inntekt-og-ytelse/inntekt/domene";
import type { Ytelse } from "~/inntekt-og-ytelse/ytelse/domene";

export type InntektOgYtelseOverlappPanelProps = {
  inntektPromise: Promise<InntektInformasjon | null>;
  ytelserPromise: Promise<Ytelse[] | null>;
};

export type MånedligData = {
  periode: string;
  inntekt: number;
  ytelse: number;
};

export type GridLinje = {
  verdi: number;
  avrundetVerdi: number;
  y: number;
};

export type XLabel = MånedligData & {
  originalIndex: number;
  x: number;
};

export type GrafFarger = {
  inntektLinje: string;
  inntektPunkt: string;
  ytelseLinje: string;
  ytelsePunkt: string;
  inntektStolpeFill: string;
  inntektStolpeStroke: string;
  ytelseStolpeFill: string;
  ytelseStolpeStroke: string;
};

export type GrafData = {
  data: MånedligData[];
  maksVerdi: number;
};

export type HoverHandler = {
  onEnter: () => void;
  onLeave: () => void;
};

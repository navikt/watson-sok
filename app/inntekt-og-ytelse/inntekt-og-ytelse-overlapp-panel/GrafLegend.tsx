import { BodyShort } from "@navikt/ds-react";
import { STANDARD_FARGER } from "./konstanter";

/**
 * Viser legend for inntekts- og ytelsesfargene.
 *
 * @example
 * <GrafLegend />
 */
export function GrafLegend() {
  return (
    <div
      className="flex items-center justify-center gap-6 mt-4"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: STANDARD_FARGER.inntektLinje }}
        />
        <BodyShort size="small">Inntekter</BodyShort>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: STANDARD_FARGER.ytelseLinje }}
        />
        <BodyShort size="small">Ytelser</BodyShort>
      </div>
    </div>
  );
}

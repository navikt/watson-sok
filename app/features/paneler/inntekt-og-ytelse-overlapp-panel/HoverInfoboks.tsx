import { BodyShort } from "@navikt/ds-react";
import { formatÅrMåned } from "~/utils/date-utils";
import { formatterBeløp } from "~/utils/number-utils";
import { storFørsteBokstav } from "~/utils/string-utils";
import type { MånedligData } from "./typer";

type HoverInfoboksProps = {
  data: MånedligData[];
  hoveredIndex: number | null;
};

/**
 * Viser detaljer om valgt måned når man hover over grafen.
 *
 * @example
 * <HoverInfoboks data={data} hoveredIndex={2} />
 */
export function HoverInfoboks({ data, hoveredIndex }: HoverInfoboksProps) {
  const valgt = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div
      className="mt-3 rounded-md border border-ax-neutral-200 bg-ax-bg-default px-4 py-3"
      aria-live="polite"
      aria-label="Detaljer om valgt måned"
    >
      {valgt ? (
        <BodyShort size="small" className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">
            {storFørsteBokstav(formatÅrMåned(valgt.periode))}
          </span>
          <span aria-label="Inntekt denne måneden">
            Inntekt: {formatterBeløp(valgt.inntekt)}
          </span>
          <span aria-label="Ytelser denne måneden">
            Ytelse: {formatterBeløp(valgt.ytelse)}
          </span>
          <span aria-label="Ytelser denne måneden" className="font-semibold">
            Totalt: {formatterBeløp(valgt.inntekt + valgt.ytelse)}
          </span>
        </BodyShort>
      ) : (
        <BodyShort size="small">
          Hold markøren over et punkt i grafen for detaljer.
        </BodyShort>
      )}
    </div>
  );
}

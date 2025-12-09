import { Heading } from "@navikt/ds-react";
import { formaterÅrMåned } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { MånedligData } from "./typer";

type SkjultTabellProps = {
  data: MånedligData[];
};

/**
 * Skjult tabell for skjermlesere med nøyaktige beløp.
 *
 * @example
 * <SkjultTabell data={data} />
 */
export function SkjultTabell({ data }: SkjultTabellProps) {
  return (
    <div className="sr-only">
      <Heading level="3" size="small">
        Månedlige inntekter og ytelser
      </Heading>
      <table>
        <thead>
          <tr>
            <th>Periode</th>
            <th>Inntekt</th>
            <th>Ytelse</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.periode}>
              <td>{formaterÅrMåned(d.periode)}</td>
              <td>{formaterBeløp(d.inntekt)}</td>
              <td>{formaterBeløp(d.ytelse)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

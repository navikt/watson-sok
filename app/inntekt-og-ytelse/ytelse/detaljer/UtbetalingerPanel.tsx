import { BodyShort, Table } from "@navikt/ds-react";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { formaterDato } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";

type UtbetalingerPanelProps = {
  utbetalinger: Ytelse["perioder"];
  ytelsenavn: string;
};

export function UtbetalingerPanel({
  utbetalinger,
  ytelsenavn,
}: UtbetalingerPanelProps) {
  if (utbetalinger.length === 0) {
    return (
      <BodyShort>Ingen utbetalinger registrert for denne ytelsen.</BodyShort>
    );
  }

  return (
    <Table size="small" zebraStripes stickyHeader>
      <caption className="text-left text-2xl font-bold text-ax-text-neutral-subtle mb-2">
        Alle utbetalinger i {ytelsenavn}
      </caption>
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col">Tidspunkt</TableHeaderCell>
          <TableHeaderCell scope="col" align="right">
            Beløp (brutto)
          </TableHeaderCell>
          <TableHeaderCell scope="col" align="right">
            Beløp (netto)
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {utbetalinger.map((periode, index) => {
          const fom = formaterDato(periode.periode.fom);
          const tom = formaterDato(periode.periode.tom);
          const tidspunkt = fom === tom ? fom : `${fom} – ${tom}`;
          return (
            <TableRow key={`${periode.periode.fom}-${index}`}>
              <TableDataCell className="whitespace-nowrap">
                {tidspunkt}
              </TableDataCell>
              <TableDataCell
                align="right"
                className={
                  periode.bruttoBeløp < 0 ? "text-ax-danger-500" : undefined
                }
              >
                {formaterBeløp(periode.bruttoBeløp ?? 0, 0)}
              </TableDataCell>
              <TableDataCell
                align="right"
                className={periode.beløp < 0 ? "text-ax-danger-500" : undefined}
              >
                {formaterBeløp(periode.beløp, 0)}
              </TableDataCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

import { BodyShort, Button, CopyButton, Table } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { useMemo } from "react";
import type { Ytelse } from "~/routes/oppslag/schemas";
import { formatterDato } from "~/utils/date-utils";
import { formatterBeløp } from "~/utils/number-utils";

type YtelseUtbetalingerModalProps = {
  ytelse: Ytelse | null;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Viser en modal med tabell over alle utbetalinger for en valgt ytelse.
 *
 * @example
 * ```tsx
 * <YtelseUtbetalingerModal
 *   ytelse={ytelse}
 *   åpen={valgt}
 *   lukk={() => setValgt(false)}
 * />
 * ```
 */
export function YtelseUtbetalingerModal({
  ytelse,
  isOpen,
  onClose,
}: YtelseUtbetalingerModalProps) {
  const sorterteUtbetalinger = useMemo(
    () =>
      ytelse
        ? [...ytelse.perioder].sort((a, b) =>
            b.periode.fom.localeCompare(a.periode.fom),
          )
        : [],
    [ytelse],
  );

  if (!ytelse) {
    return null;
  }

  return (
    <Modal
      width="medium"
      open={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      header={{
        heading: `Utbetalinger for ${ytelse.stonadType}`,
      }}
    >
      <ModalBody className="min-w-md">
        {sorterteUtbetalinger.length === 0 ? (
          <BodyShort>
            Ingen utbetalinger registrert for denne ytelsen.
          </BodyShort>
        ) : (
          <Table size="small" zebraStripes stickyHeader>
            <caption className="text-left text-sm font-semibold text-text-subtle mb-2">
              Alle utbetalinger i ytelsen
            </caption>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">Tidspunkt</TableHeaderCell>
                <TableHeaderCell scope="col">Beløp</TableHeaderCell>
                <TableHeaderCell scope="col">Bilagsnummer</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorterteUtbetalinger.map((periode, index) => {
                const fom = formatterDato(periode.periode.fom);
                const tom = formatterDato(periode.periode.tom);
                const tidspunkt = fom === tom ? fom : `${fom} – ${tom}`;
                return (
                  <TableRow key={`${periode.periode.fom}-${index}`}>
                    <TableDataCell className="whitespace-nowrap">
                      {tidspunkt}
                    </TableDataCell>
                    <TableDataCell
                      align="right"
                      className={
                        periode.beløp < 0 ? "text-ax-danger-500" : undefined
                      }
                    >
                      {formatterBeløp(periode.beløp, 0)}
                    </TableDataCell>
                    <TableDataCell>
                      {periode.info ?? "–"}{" "}
                      {periode.info && (
                        <CopyButton copyText={periode.info ?? ""} />
                      )}
                    </TableDataCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Lukk
        </Button>
      </ModalFooter>
    </Modal>
  );
}

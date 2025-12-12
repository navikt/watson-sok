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
import { formaterDato } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "./domene";

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
                        periode.beløp < 0 ? "text-ax-danger-500" : undefined
                      }
                    >
                      {formaterBeløp(periode.beløp, 0)}
                    </TableDataCell>
                    <TableDataCell className="flex items-center gap-1">
                      {periode.info ?? "–"}{" "}
                      {periode.info && (
                        <CopyButton copyText={periode.info} size="small" />
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

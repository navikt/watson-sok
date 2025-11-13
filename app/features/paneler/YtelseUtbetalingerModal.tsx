import { BodyShort, Button, Table } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
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
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">Tidspunkt</Table.HeaderCell>
                <Table.HeaderCell scope="col">Beløp</Table.HeaderCell>
                <Table.HeaderCell scope="col">Referanse</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorterteUtbetalinger.map((periode, index) => {
                const fom = formatterDato(periode.periode.fom);
                const tom = formatterDato(periode.periode.tom);
                const tidspunkt = fom === tom ? fom : `${fom} – ${tom}`;
                return (
                  <Table.Row key={`${periode.periode.fom}-${index}`}>
                    <Table.DataCell className="whitespace-nowrap">
                      {tidspunkt}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {formatterBeløp(periode.beløp, 0)}
                    </Table.DataCell>
                    <Table.DataCell>{periode.info ?? "–"}</Table.DataCell>
                  </Table.Row>
                );
              })}
            </Table.Body>
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

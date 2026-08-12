import { BodyShort, Link, Table } from "@navikt/ds-react";
import { Modal, ModalBody } from "@navikt/ds-react/Modal";
import { type ReactNode, useRef } from "react";

import { formaterDato } from "~/utils/date-utils";

import type { HistoriskAdresse } from "./domene";
import { formaterAdresse } from "./utils/adresse-utils";

type AdresseHistorikkModalProps = {
  /** Teksten som vises som klikkbar lenke (nåværende folkeregistrerte adresse) */
  triggerInnhold: ReactNode;
  adresseHistorikk: HistoriskAdresse[] | null | undefined;
};

/**
 * Viser folkeregistrert adresse som en klikkbar lenke. Klikk åpner en modal
 * med adressehistorikk siste 5 år. Uten historikk vises kun adressen som tekst.
 */
export function AdresseHistorikkModal({
  triggerInnhold,
  adresseHistorikk,
}: AdresseHistorikkModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const historikk = adresseHistorikk ?? [];

  if (historikk.length === 0) {
    return <BodyShort>{triggerInnhold}</BodyShort>;
  }

  return (
    <>
      <Link
        as="button"
        type="button"
        onClick={() => ref.current?.showModal()}
        className="text-left p-0"
      >
        {triggerInnhold}
      </Link>

      <Modal ref={ref} header={{ heading: "Adressehistorikk" }} width="medium">
        <ModalBody>
          <BodyShort size="small" className="mb-4 text-ax-text-neutral-subtle">
            Folkeregistrerte adresser siste 5 år
          </BodyShort>
          <Table size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">Adresse</Table.HeaderCell>
                <Table.HeaderCell scope="col">Fra</Table.HeaderCell>
                <Table.HeaderCell scope="col">Til</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {historikk.map((rad, idx) => (
                <Table.Row key={idx}>
                  <Table.DataCell>
                    {formaterAdresse(rad.adresse)}
                  </Table.DataCell>
                  <Table.DataCell>
                    {rad.gyldigFraOgMed
                      ? formaterDato(rad.gyldigFraOgMed)
                      : "–"}
                  </Table.DataCell>
                  <Table.DataCell>
                    {rad.gyldigTilOgMed
                      ? formaterDato(rad.gyldigTilOgMed)
                      : "Nåværende"}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </ModalBody>
      </Modal>
    </>
  );
}

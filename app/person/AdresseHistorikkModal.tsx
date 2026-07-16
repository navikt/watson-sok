import { BodyShort, Link, Table } from "@navikt/ds-react";
import { Modal, ModalBody } from "@navikt/ds-react/Modal";
import { useRef } from "react";

import type { HistoriskAdresse } from "./domene";
import { formaterAdresse } from "./utils/adresse-utils";

type AdresseHistorikkModalProps = {
  adresseHistorikk: HistoriskAdresse[] | null | undefined;
};

/**
 * En modal (med trigger-knapp) som viser folkeregistrerte adresser siste 5 år
 */
export function AdresseHistorikkModal({
  adresseHistorikk,
}: AdresseHistorikkModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const historikk = adresseHistorikk ?? [];

  if (historikk.length === 0) {
    return <BodyShort>Ingen adressehistorikk registrert</BodyShort>;
  }

  return (
    <>
      <Link
        as="button"
        onClick={() => ref.current?.showModal()}
        className="text-left p-0"
      >
        Se adressehistorikk ({historikk.length})
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

function formaterDato(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

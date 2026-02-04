import { BodyShort, Button, Table, Tabs } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { useMemo } from "react";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { MeldekortPanel } from "~/meldekort/MeldekortPanel";
import { formaterDato } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "./domene";

const YTELSER_MED_MELDEKORT = ["Dagpenger"] as const;

function harMeldekort(
  stonadType: string,
): stonadType is (typeof YTELSER_MED_MELDEKORT)[number] {
  return YTELSER_MED_MELDEKORT.some(
    (ytelse) => stonadType.toLowerCase() === ytelse.toLowerCase(),
  );
}

type YtelsedetaljerModalProps = {
  ytelse: Ytelse | null;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Viser en modal med detaljer for en valgt ytelse.
 *
 * @example
 * ```tsx
 * <YtelsedetaljerModal
 *   ytelse={ytelse}
 *   isOpen={valgt}
 *   onClose={() => setValgt(false)}
 * />
 * ```
 */
export function YtelsedetaljerModal({
  ytelse,
  isOpen,
  onClose,
}: YtelsedetaljerModalProps) {
  const erMeldekortPanelAktivert = useEnkeltFeatureFlagg(
    FeatureFlagg.VIS_MELDEKORT_PANEL,
  );
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

  const visMeldekortTab =
    erMeldekortPanelAktivert && harMeldekort(ytelse.stonadType);

  return (
    <Modal
      width="medium"
      open={isOpen}
      onClose={onClose}
      closeOnBackdropClick
      header={{
        heading: ytelse.stonadType,
      }}
    >
      <ModalBody className="min-w-md flex flex-col gap-8">
        <Tabs defaultValue="oppsummering" fill>
          <Tabs.List>
            <Tabs.Tab value="oppsummering" label="Oppsummering" />
            <Tabs.Tab value="utbetalinger" label="Utbetalinger" />
            {visMeldekortTab && (
              <Tabs.Tab value="meldekort" label="Meldekort" />
            )}
          </Tabs.List>
          <Tabs.Panel value="oppsummering" className="pt-4">
            <BodyShort>Oppsummering kommer snart.</BodyShort>
          </Tabs.Panel>
          <Tabs.Panel value="utbetalinger" className="pt-4">
            <UtbetalingerTabell
              utbetalinger={sorterteUtbetalinger}
              ytelsenavn={ytelse.stonadType}
            />
          </Tabs.Panel>
          {visMeldekortTab && (
            <Tabs.Panel value="meldekort" className="pt-4">
              <MeldekortPanel ytelse="dagpenger" />
            </Tabs.Panel>
          )}
        </Tabs>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Lukk
        </Button>
      </ModalFooter>
    </Modal>
  );
}

type UtbetalingerTabellProps = {
  utbetalinger: Ytelse["perioder"];
  ytelsenavn: string;
};

function UtbetalingerTabell({
  utbetalinger,
  ytelsenavn,
}: UtbetalingerTabellProps) {
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

import { Button, Tabs } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import { useMemo } from "react";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { MeldekortProvider } from "~/meldekort/MeldekortContext";
import { MeldekortPanel } from "~/meldekort/MeldekortPanel";
import { useTidsvindu } from "~/tidsvindu/Tidsvindu";
import type { Ytelse } from "../domene";
import { OppsummeringPanel } from "./OppsummeringPanel";
import { UtbetalingerPanel } from "./UtbetalingerPanel";

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
  const { tidsvinduIAntallMåneder } = useTidsvindu();

  const filtrertePerioder = useMemo(() => {
    if (!ytelse) return [];

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - tidsvinduIAntallMåneder);

    return [...ytelse.perioder]
      .filter((p) => new Date(p.periode.tom) >= cutoff)
      .sort((a, b) => b.periode.fom.localeCompare(a.periode.fom));
  }, [ytelse, tidsvinduIAntallMåneder]);

  if (!ytelse) {
    return null;
  }

  const visMeldekortTab =
    erMeldekortPanelAktivert && harMeldekort(ytelse.stonadType);

  const innhold = (
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
            <OppsummeringPanel perioder={filtrertePerioder} />
          </Tabs.Panel>
          <Tabs.Panel value="utbetalinger" className="pt-4">
            <UtbetalingerPanel
              utbetalinger={filtrertePerioder}
              ytelsenavn={ytelse.stonadType}
            />
          </Tabs.Panel>
          {visMeldekortTab && (
            <Tabs.Panel value="meldekort" className="pt-4">
              <MeldekortPanel />
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

  if (visMeldekortTab) {
    return <MeldekortProvider ytelse="dagpenger">{innhold}</MeldekortProvider>;
  }

  return innhold;
}

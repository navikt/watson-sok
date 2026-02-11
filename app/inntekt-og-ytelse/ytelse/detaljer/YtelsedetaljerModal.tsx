import { Button, Tabs } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import { useMemo } from "react";
import { sporHendelse } from "~/analytics/analytics";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { MeldekortProvider } from "~/meldekort/MeldekortContext";
import { MeldekortPanel } from "~/meldekort/MeldekortPanel";
import { formaterDato } from "~/utils/date-utils";
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
  fraDato: string;
  tilDato: string;
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
 *   fraDato="2025-01-01"
 *   tilDato="2025-06-01"
 *   isOpen={valgt}
 *   onClose={() => setValgt(false)}
 * />
 * ```
 */
export function YtelsedetaljerModal({
  ytelse,
  fraDato,
  tilDato,
  isOpen,
  onClose,
}: YtelsedetaljerModalProps) {
  const erMeldekortPanelAktivert = useEnkeltFeatureFlagg(
    FeatureFlagg.VIS_MELDEKORT_PANEL,
  );

  const filtrertePerioder = useMemo(() => {
    if (!ytelse) return [];

    const fra = new Date(fraDato);
    const til = new Date(tilDato);

    return [...ytelse.perioder]
      .filter(
        (p) => new Date(p.periode.tom) >= fra && new Date(p.periode.fom) <= til,
      )
      .sort((a, b) => b.periode.fom.localeCompare(a.periode.fom));
  }, [ytelse, fraDato, tilDato]);

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
        heading: `${ytelse.stonadType} (${formaterDato(fraDato)} – ${formaterDato(tilDato)})`,
      }}
      placement="top"
    >
      <ModalBody className="min-w-md flex flex-col gap-8">
        <Tabs
          defaultValue={visMeldekortTab ? "meldekort" : "utbetalinger"}
          fill
        >
          <Tabs.List>
            {visMeldekortTab ? (
              <>
                <Tabs.Tab
                  value="meldekort"
                  label="Meldekort"
                  onClick={() =>
                    sporHendelse("ytelse modal tab meldekort åpnet")
                  }
                />
                <Tabs.Tab
                  value="oppsummering"
                  label="Oppsummering"
                  onClick={() =>
                    sporHendelse("ytelse modal tab oppsummering åpnet")
                  }
                />
                <Tabs.Tab
                  value="utbetalinger"
                  label="Utbetalinger"
                  onClick={() =>
                    sporHendelse("ytelse modal tab utbetalinger åpnet")
                  }
                />
              </>
            ) : (
              <>
                <Tabs.Tab
                  value="utbetalinger"
                  label="Utbetalinger"
                  onClick={() =>
                    sporHendelse("ytelse modal tab utbetalinger åpnet")
                  }
                />
                <Tabs.Tab
                  value="oppsummering"
                  label="Oppsummering"
                  onClick={() =>
                    sporHendelse("ytelse modal tab oppsummering åpnet")
                  }
                />
              </>
            )}
          </Tabs.List>
          <Tabs.Panel value="oppsummering" className="pt-4">
            <OppsummeringPanel
              perioder={filtrertePerioder}
              fraDato={fraDato}
              tilDato={tilDato}
            />
          </Tabs.Panel>
          <Tabs.Panel value="utbetalinger" className="pt-4">
            <UtbetalingerPanel
              utbetalinger={filtrertePerioder}
              ytelsenavn={ytelse.stonadType}
            />
          </Tabs.Panel>
          {visMeldekortTab && (
            <Tabs.Panel value="meldekort" className="pt-4">
              <MeldekortPanel fraDato={fraDato} tilDato={tilDato} />
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

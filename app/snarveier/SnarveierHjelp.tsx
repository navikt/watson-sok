import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Button, Heading, Tag, Theme } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import { hentSnarveierGruppert, kategoriTilNavn } from "./snarveier";

type SnarveierHjelpModalProps = {
  ref: React.RefObject<HTMLDialogElement | null>;
  gruppert: ReturnType<typeof hentSnarveierGruppert>;
};

/**
 * Selve modalen som viser snarveier, gruppert etter kategori.
 * Eksponerer ref så den kan åpnes programmatisk av Snarveier-komponenten.
 */
export function SnarveierHjelpModal({
  ref,
  gruppert,
}: SnarveierHjelpModalProps) {
  return (
    <Theme theme="light">
      <Modal
        ref={ref}
        header={{
          heading: "Tastatursnarveier",
          icon: <InformationSquareIcon aria-hidden />,
        }}
        closeOnBackdropClick
      >
        <ModalBody className="min-w-sm flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Tag variant="info" size="small">
              Alt + K
            </Tag>
            <span className="text-sm">Søk etter bruker</span>
          </div>

          {(Object.keys(gruppert) as (keyof typeof gruppert)[]).map(
            (kategori) => {
              const snarveier = gruppert[kategori];
              if (snarveier.length === 0) return null;

              return (
                <div key={kategori}>
                  <Heading level="3" size="xsmall" spacing>
                    {kategoriTilNavn(kategori)}
                  </Heading>
                  <ul className="flex flex-col gap-2 list-none p-0 m-0">
                    {snarveier.map((snarvei) => (
                      <li
                        key={snarvei.tast}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{snarvei.beskrivelse}</span>
                        <kbd className="text-sm bg-ax-bg-subtle border border-ax-neutral-400 rounded px-2 py-0.5 font-mono">
                          {snarvei.tastLabel}
                        </kbd>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            },
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => ref.current?.close()}>
            Lukk
          </Button>
        </ModalFooter>
      </Modal>
    </Theme>
  );
}

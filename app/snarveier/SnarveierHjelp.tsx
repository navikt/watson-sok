import { InformationSquareIcon } from "@navikt/aksel-icons";
import { Button, Heading, Theme } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import { useEffect, type RefObject } from "react";
import { sporHendelse } from "~/analytics/analytics";
import { hentSnarveierGruppert, kategoriTilNavn } from "./snarveier";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

type SnarveierHjelpModalProps = {
  ref: RefObject<HTMLDialogElement | null>;
};

/**
 * Selvdrevet modal som viser tastatursnarveier gruppert etter kategori.
 * Lytter på `?`-tasten for å åpne seg selv, og kan også åpnes programmatisk via ref.
 */
export function SnarveierHjelpModal({ ref }: SnarveierHjelpModalProps) {
  const gruppert = hentSnarveierGruppert();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "?") {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target && INPUT_TAGS.has(target.tagName)) {
        return;
      }

      if (ref.current?.open) {
        return;
      }

      e.preventDefault();
      sporHendelse("hotkey brukt", { hotkey: "?" });
      ref.current?.showModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ref]);
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

import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SnarveierHjelpModal } from "./SnarveierHjelp";
import { PanelId, hentSnarveierGruppert } from "./snarveier";
import { usePanelNavigering } from "./usePanelNavigering";

const FORRIGE_PERIODE_KNAPP_LABEL = "Forrige periode";
const NESTE_PERIODE_KNAPP_LABEL = "Neste periode";
const FAMILIEMEDLEMMER_MODAL_ID = "familiemedlemmer-åpne";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Registrerer alle tastatursnarveier for oppslagssiden.
 * Rendrer også snarvei-hjelp-modalen.
 */
export function Snarveier() {
  const { navigerTilPanel } = usePanelNavigering();
  const hjelpModalRef = useRef<HTMLDialogElement>(null);
  const gruppert = hentSnarveierGruppert();

  // Panel-snarveier (Alt+1–6)
  useHotkeys("alt+1", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.BRUKERINFORMASJON);
  });
  useHotkeys("alt+2", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.YTELSER);
  });
  useHotkeys("alt+3", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.INNTEKT_OG_YTELSE_OVERLAPP);
  });
  useHotkeys("alt+4", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.ARBEIDSFORHOLD);
  });
  useHotkeys("alt+5", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.INNTEKT);
  });
  useHotkeys("alt+6", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.INNTEKTSOPPSUMMERING);
  });

  // Fokuser tidsvindu-velger (Alt+T)
  useHotkeys("alt+t", (e) => {
    e.preventDefault();
    navigerTilPanel(PanelId.TIDSVINDU);
  });

  // Åpne familiemedlemmer-modal (Alt+F)
  useHotkeys("alt+f", (e) => {
    e.preventDefault();
    const knapp = document.getElementById(FAMILIEMEDLEMMER_MODAL_ID);
    if (knapp instanceof HTMLButtonElement) {
      knapp.click();
    }
  });

  // Tidslinje-navigering (Alt+← og Alt+→)
  useHotkeys("alt+left", (e) => {
    e.preventDefault();
    const knapp = document.querySelector<HTMLButtonElement>(
      `button[aria-label="${FORRIGE_PERIODE_KNAPP_LABEL}"]`,
    );
    if (knapp && !knapp.disabled) {
      knapp.click();
    }
  });
  useHotkeys("alt+right", (e) => {
    e.preventDefault();
    const knapp = document.querySelector<HTMLButtonElement>(
      `button[aria-label="${NESTE_PERIODE_KNAPP_LABEL}"]`,
    );
    if (knapp && !knapp.disabled) {
      knapp.click();
    }
  });

  // Vis hjelp-modal (?) — bruker keydown med event.key for å fungere på alle tastaturlayouter
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "?") return;
      const target = e.target as HTMLElement | null;
      if (target && INPUT_TAGS.has(target.tagName)) return;

      e.preventDefault();
      hjelpModalRef.current?.showModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <SnarveierHjelpModal ref={hjelpModalRef} gruppert={gruppert} />;
}

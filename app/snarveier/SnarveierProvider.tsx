import { useHotkeys } from "react-hotkeys-hook";
import { sporHendelse } from "~/analytics/analytics";
import { PanelId } from "./snarveier";
import { usePanelNavigering } from "./usePanelNavigering";

const FORRIGE_PERIODE_KNAPP_LABEL = "Forrige periode";
const NESTE_PERIODE_KNAPP_LABEL = "Neste periode";
const FAMILIEMEDLEMMER_MODAL_ID = "familiemedlemmer-åpne";

function spor(hotkey: string) {
  sporHendelse("hotkey brukt", { hotkey });
}

/**
 * Registrerer alle tastatursnarveier for oppslagssiden.
 * Rendrer ingen JSX – modalen eies av AppHeader.
 */
export function Snarveier() {
  const { navigerTilPanel } = usePanelNavigering();

  // Panel-snarveier (Alt+1–6)
  useHotkeys("alt+1", (e) => {
    e.preventDefault();
    spor("alt+1");
    navigerTilPanel(PanelId.BRUKERINFORMASJON);
  });
  useHotkeys("alt+2", (e) => {
    e.preventDefault();
    spor("alt+2");
    navigerTilPanel(PanelId.YTELSER);
  });
  useHotkeys("alt+3", (e) => {
    e.preventDefault();
    spor("alt+3");
    navigerTilPanel(PanelId.INNTEKT_OG_YTELSE_OVERLAPP);
  });
  useHotkeys("alt+4", (e) => {
    e.preventDefault();
    spor("alt+4");
    navigerTilPanel(PanelId.ARBEIDSFORHOLD);
  });
  useHotkeys("alt+5", (e) => {
    e.preventDefault();
    spor("alt+5");
    navigerTilPanel(PanelId.INNTEKT);
  });
  useHotkeys("alt+6", (e) => {
    e.preventDefault();
    spor("alt+6");
    navigerTilPanel(PanelId.INNTEKTSOPPSUMMERING);
  });

  // Fokuser tidsvindu-velger (Alt+T)
  useHotkeys("alt+t", (e) => {
    e.preventDefault();
    spor("alt+t");
    navigerTilPanel(PanelId.TIDSVINDU);
  });

  // Åpne familiemedlemmer-modal (Alt+F)
  useHotkeys("alt+f", (e) => {
    e.preventDefault();
    spor("alt+f");
    const knapp = document.getElementById(FAMILIEMEDLEMMER_MODAL_ID);
    if (knapp instanceof HTMLButtonElement) {
      knapp.click();
    }
  });

  // Tidslinje-navigering (Alt+← og Alt+→)
  useHotkeys("alt+left", (e) => {
    e.preventDefault();
    spor("alt+left");
    const knapp = document.querySelector<HTMLButtonElement>(
      `button[aria-label="${FORRIGE_PERIODE_KNAPP_LABEL}"]`,
    );
    if (knapp && !knapp.disabled) {
      knapp.click();
    }
  });
  useHotkeys("alt+right", (e) => {
    e.preventDefault();
    spor("alt+right");
    const knapp = document.querySelector<HTMLButtonElement>(
      `button[aria-label="${NESTE_PERIODE_KNAPP_LABEL}"]`,
    );
    if (knapp && !knapp.disabled) {
      knapp.click();
    }
  });

  return null;
}

import { useCallback } from "react";

/**
 * Hook som returnerer en funksjon for å navigere til et panel.
 * Scroller panelet i view og setter fokus på det.
 */
export function usePanelNavigering() {
  const navigerTilPanel = useCallback((panelId: string) => {
    const element = document.getElementById(panelId);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    element.focus({ preventScroll: true });
  }, []);

  return { navigerTilPanel };
}

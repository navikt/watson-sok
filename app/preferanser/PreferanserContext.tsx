import { Theme } from "@navikt/ds-react";
import { createContext, useContext, useState } from "react";
import { logger } from "~/logging/logging";
import { RouteConfig } from "~/routeConfig";
import {
  type GrafVisning,
  type Preferanser,
  type Theme as ThemeType,
  defaultPreferanser,
} from "./PreferanserCookie";

const PreferanserContext = createContext<{
  theme: ThemeType;
  toggleTheme: () => Promise<void>;
  grafVisning: GrafVisning;
  setGrafVisning: (visning: GrafVisning) => Promise<void>;
}>({
  theme: defaultPreferanser.theme,
  toggleTheme: async () => {},
  grafVisning: defaultPreferanser.grafVisning,
  setGrafVisning: async () => {},
});

/** Hook for å lese og oppdatere brukerpreferanser. */
export function usePreferanser() {
  const context = useContext(PreferanserContext);
  if (!context) {
    throw new Error("usePreferanser must be used within a PreferanserProvider");
  }
  return context;
}

type PreferanserProviderProps = {
  children: React.ReactNode;
  defaultPreferanser?: Preferanser;
};

export function PreferanserProvider({
  children,
  defaultPreferanser: initial = defaultPreferanser,
}: PreferanserProviderProps) {
  const [theme, setTheme] = useState<ThemeType>(initial.theme);
  const [grafVisning, setGrafVisningState] = useState<GrafVisning>(
    initial.grafVisning,
  );

  async function oppdaterPreferanse(nøkkel: keyof Preferanser, verdi: string) {
    try {
      const formData = new FormData();
      formData.append(nøkkel, verdi);

      await fetch(RouteConfig.API.PREFERANSER, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      logger.error("Kunne ikke lagre preferanse", { error, nøkkel });
      throw error;
    }
  }

  const toggleTheme = async () => {
    const oldTheme = theme;
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    try {
      await oppdaterPreferanse("theme", newTheme);
    } catch {
      setTheme(oldTheme);
    }
  };

  const setGrafVisning = async (visning: GrafVisning) => {
    const oldVisning = grafVisning;
    setGrafVisningState(visning);

    try {
      await oppdaterPreferanse("grafVisning", visning);
    } catch {
      setGrafVisningState(oldVisning);
    }
  };

  return (
    <PreferanserContext.Provider
      value={{ theme, toggleTheme, grafVisning, setGrafVisning }}
    >
      <Theme theme={theme}>{children}</Theme>
    </PreferanserContext.Provider>
  );
}

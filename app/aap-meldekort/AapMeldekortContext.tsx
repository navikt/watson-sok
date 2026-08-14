import { createContext, use, useEffect, type ReactNode } from "react";
import { useFetcher, useSearchParams } from "react-router";

import { RouteConfig } from "~/routeConfig";

import type { loader } from "./api.route";
import type { AapMeldekortRespons } from "./domene";

type AapMeldekortState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; vedtak: AapMeldekortRespons };

type AapMeldekortContextType = {
  state: AapMeldekortState;
};

const AapMeldekortContext = createContext<AapMeldekortContextType | null>(null);

type AapMeldekortProviderProps = {
  children: ReactNode;
};

/**
 * Provider som henter og deler AAP-meldekort-data (vedtak + perioder)
 * på tvers av komponenter.
 */
export function AapMeldekortProvider({ children }: AapMeldekortProviderProps) {
  const fetcher = useFetcher<typeof loader>();
  const [searchParams] = useSearchParams();
  const traceLogging = searchParams.get("traceLogging") === "true";
  const utvidet = searchParams.get("utvidet") === "true";

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(
        `${RouteConfig.API.AAP_MELDEKORT}?traceLogging=${traceLogging}&utvidet=${utvidet}`,
      );
    }
  }, [fetcher, traceLogging, utvidet]);

  const state: AapMeldekortState =
    fetcher.state === "loading" || !fetcher.data
      ? { status: "loading" }
      : "error" in fetcher.data
        ? { status: "error", error: fetcher.data.error }
        : { status: "success", vedtak: fetcher.data };

  return (
    <AapMeldekortContext.Provider value={{ state }}>
      {children}
    </AapMeldekortContext.Provider>
  );
}

/**
 * Hook for å hente AAP-meldekort-data fra konteksten.
 * Returnerer null hvis brukt utenfor AapMeldekortProvider.
 */
export function useAapMeldekort(): AapMeldekortState | null {
  const context = use(AapMeldekortContext);
  return context?.state ?? null;
}

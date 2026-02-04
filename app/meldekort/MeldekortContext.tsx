import { createContext, use, useEffect, type ReactNode } from "react";
import { useFetcher } from "react-router";
import { RouteConfig } from "~/routeConfig";
import type { loader } from "./api.route";
import type { MeldekortRespons } from "./domene";

type GyldigYtelse = "dagpenger";

type MeldekortState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; meldekort: MeldekortRespons };

type MeldekortContextType = {
  state: MeldekortState;
};

const MeldekortContext = createContext<MeldekortContextType | null>(null);

type MeldekortProviderProps = {
  ytelse: GyldigYtelse;
  children: ReactNode;
};

/**
 * Provider som henter og deler meldekort-data på tvers av komponenter.
 */
export function MeldekortProvider({
  ytelse,
  children,
}: MeldekortProviderProps) {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(`${RouteConfig.API.MELDEKORT}?ytelse=${ytelse}`);
    }
  }, [fetcher.state, fetcher.data, fetcher.load, ytelse]);

  const state: MeldekortState =
    fetcher.state === "loading" || !fetcher.data
      ? { status: "loading" }
      : "error" in fetcher.data
        ? { status: "error", error: fetcher.data.error }
        : { status: "success", meldekort: fetcher.data };

  return (
    <MeldekortContext.Provider value={{ state }}>
      {children}
    </MeldekortContext.Provider>
  );
}

/**
 * Hook for å hente meldekort-data fra konteksten.
 * Må brukes innenfor en MeldekortProvider.
 */
export function useMeldekort(): MeldekortState {
  const context = use(MeldekortContext);
  if (!context) {
    throw new Error("useMeldekort må brukes innenfor en MeldekortProvider");
  }
  return context.state;
}

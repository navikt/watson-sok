import { ToggleGroup } from "@navikt/ds-react";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { createContext, use, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

type TidsvinduPeriode = "6 måneder" | "1 år" | "3 år" | "10 år" | "tilpasset";

type TidsvinduContextType = {
  fraDato: Date;
  tilDato: Date;
  setTidsvindu: (tidsvindu: Exclude<TidsvinduPeriode, "tilpasset">) => void;
  setCustomDatoer: (fra: Date, til: Date) => TidsvinduValideringsfeil | null;
};
const TidsvinduContext = createContext<TidsvinduContextType | null>(null);

/** Konverterer tidsvindu-periode til antall måneder */
export function tidsvinduTilMåneder(
  tidsvindu: Exclude<TidsvinduPeriode, "tilpasset">,
): number {
  switch (tidsvindu) {
    case "6 måneder":
      return 6;
    case "1 år":
      return 12;
    case "3 år":
      return 36;
    case "10 år":
      return 120;
  }
}

/** Beregner fra- og til-dato basert på antall måneder tilbake i tid */
export function beregnTidsvinduDatoer(
  antallMåneder: number,
  nå: Date = new Date(),
): { fraDato: Date; tilDato: Date } {
  const tilDato = new Date(nå);
  const fraDato = new Date(nå);
  fraDato.setMonth(fraDato.getMonth() - antallMåneder);
  return { fraDato, tilDato };
}

/** Beregner antall måneder mellom to datoer */
export function beregnMånederMellomDatoer(fraDato: Date, tilDato: Date): number {
  return (
    (tilDato.getFullYear() - fraDato.getFullYear()) * 12 +
    (tilDato.getMonth() - fraDato.getMonth())
  );
}

export type TidsvinduValideringsfeil =
  | "fra-etter-til"
  | "for-langt-tilbake"
  | "fremtidig-dato";

/** Validerer at datoene er gyldige for tidsvindu */
export function validerTidsvinduDatoer(
  fraDato: Date,
  tilDato: Date,
  nå: Date = new Date(),
): TidsvinduValideringsfeil | null {
  // Fra-dato må være før til-dato
  if (fraDato > tilDato) {
    return "fra-etter-til";
  }

  // Til-dato kan ikke være i fremtiden
  const iDag = new Date(nå.getFullYear(), nå.getMonth(), nå.getDate());
  const tilDatoNormalisert = new Date(
    tilDato.getFullYear(),
    tilDato.getMonth(),
    tilDato.getDate(),
  );
  if (tilDatoNormalisert > iDag) {
    return "fremtidig-dato";
  }

  // Fra-dato kan ikke være mer enn 10 år tilbake
  const tiÅrTilbake = new Date(nå);
  tiÅrTilbake.setFullYear(tiÅrTilbake.getFullYear() - 10);
  const tiÅrTilbakeNormalisert = new Date(
    tiÅrTilbake.getFullYear(),
    tiÅrTilbake.getMonth(),
    tiÅrTilbake.getDate(),
  );
  if (fraDato < tiÅrTilbakeNormalisert) {
    return "for-langt-tilbake";
  }

  return null;
}

/** Deriverer hvilken preset som matcher datoene, eller "tilpasset" */
export function utledTidsvinduPeriode(
  fraDato: Date,
  tilDato: Date,
  nå: Date = new Date(),
): TidsvinduPeriode {
  // Sjekk om tilDato er dagens dato (samme dag)
  const erTilDatoIDag =
    tilDato.getFullYear() === nå.getFullYear() &&
    tilDato.getMonth() === nå.getMonth() &&
    tilDato.getDate() === nå.getDate();

  if (!erTilDatoIDag) {
    return "tilpasset";
  }

  const måneder = beregnMånederMellomDatoer(fraDato, tilDato);

  // Sjekk også at dagen matcher (ikke bare måneden)
  const forventetFraDato = new Date(nå);
  forventetFraDato.setMonth(forventetFraDato.getMonth() - måneder);
  const erFraDatoKorrekt =
    fraDato.getFullYear() === forventetFraDato.getFullYear() &&
    fraDato.getMonth() === forventetFraDato.getMonth() &&
    fraDato.getDate() === forventetFraDato.getDate();

  if (!erFraDatoKorrekt) {
    return "tilpasset";
  }

  switch (måneder) {
    case 6:
      return "6 måneder";
    case 12:
      return "1 år";
    case 36:
      return "3 år";
    case 120:
      return "10 år";
    default:
      return "tilpasset";
  }
}

/**
 * Holder styr på hvilket tidsvindu som skal vises i visualiseringer
 */
export const TidsvinduProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const utvidet = searchParams.get("utvidet") === "true";

  // Initialiser med preset basert på URL-param
  const initialDatoer = beregnTidsvinduDatoer(utvidet ? 120 : 36);
  const [fraDato, setFraDato] = useState<Date>(initialDatoer.fraDato);
  const [tilDato, setTilDato] = useState<Date>(initialDatoer.tilDato);

  const context = useMemo(
    () => ({
      fraDato,
      tilDato,
      setTidsvindu: (tidsvindu: Exclude<TidsvinduPeriode, "tilpasset">) => {
        const måneder = tidsvinduTilMåneder(tidsvindu);
        const datoer = beregnTidsvinduDatoer(måneder);
        setFraDato(datoer.fraDato);
        setTilDato(datoer.tilDato);
        if (tidsvindu === "10 år") {
          setSearchParams({ utvidet: "true" });
        }
      },
      setCustomDatoer: (fra: Date, til: Date) => {
        const feil = validerTidsvinduDatoer(fra, til);
        if (feil) {
          return feil;
        }
        setFraDato(fra);
        setTilDato(til);
        return null;
      },
    }),
    [fraDato, tilDato, setSearchParams],
  );
  return (
    <TidsvinduContext.Provider value={context}>
      {children}
    </TidsvinduContext.Provider>
  );
};

/**
 * Returnerer tidsvindu og en måte å endre det på
 */
export const useTidsvindu = () => {
  const context = use(TidsvinduContext);
  if (!context) {
    throw new Error("useTidsvindu må brukes innenfor en TidsvinduProvider");
  }

  const tidsvinduIAntallMåneder = beregnMånederMellomDatoer(
    context.fraDato,
    context.tilDato,
  );
  const tidsvindu = utledTidsvinduPeriode(context.fraDato, context.tilDato);

  return {
    ...context,
    tidsvindu,
    tidsvinduIAntallMåneder,
  };
};

/**
 * Lar brukeren velge hvor stort tidsvindu som skal vises i visualiseringer
 */
export const TidsvinduVelger = () => {
  const { tidsvindu, setTidsvindu } = useTidsvindu();
  return (
    <ToggleGroup
      data-color="neutral"
      size="small"
      value={tidsvindu}
      aria-label="Velg tidsvindu"
      onChange={(value) =>
        setTidsvindu(value as Exclude<TidsvinduPeriode, "tilpasset">)
      }
      className="bg-ax-bg-default rounded-lg w-fit"
    >
      <ToggleGroupItem value="6 måneder" label="6 mnd" />
      <ToggleGroupItem value="1 år" label="1 år" />
      <ToggleGroupItem value="3 år" label="3 år" />
      <ToggleGroupItem value="10 år" label="10 år" />
    </ToggleGroup>
  );
};

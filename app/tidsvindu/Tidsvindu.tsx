import { ToggleGroup } from "@navikt/ds-react";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { createContext, use, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

type TidsvinduPeriode = "6 måneder" | "1 år" | "3 år" | "10 år" | "tilpasset";

type TidsvinduContextType = {
  tidsvindu: TidsvinduPeriode;
  setTidsvindu: (tidsvindu: TidsvinduPeriode) => void;
  customFraDato: Date | null;
  customTilDato: Date | null;
  setCustomDatoer: (fra: Date, til: Date) => void;
};
const TidsvinduContext = createContext<TidsvinduContextType | null>(null);

/** Konverterer tidsvindu-periode til antall måneder (kun for preset-perioder) */
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
  const [tidsvindu, internalSetTidsvindu] = useState<TidsvinduPeriode>(
    utvidet ? "10 år" : "3 år",
  );
  const [customFraDato, setCustomFraDato] = useState<Date | null>(null);
  const [customTilDato, setCustomTilDato] = useState<Date | null>(null);

  const context = useMemo(
    () => ({
      tidsvindu,
      setTidsvindu: (tidsvindu: TidsvinduPeriode) => {
        internalSetTidsvindu(tidsvindu);
        if (tidsvindu === "10 år") {
          setSearchParams({ utvidet: "true" });
        }
      },
      customFraDato,
      customTilDato,
      setCustomDatoer: (fra: Date, til: Date) => {
        setCustomFraDato(fra);
        setCustomTilDato(til);
        internalSetTidsvindu("tilpasset");
      },
    }),
    [tidsvindu, customFraDato, customTilDato, setSearchParams],
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

  let fraDato: Date;
  let tilDato: Date;

  if (
    context.tidsvindu === "tilpasset" &&
    context.customFraDato &&
    context.customTilDato
  ) {
    fraDato = context.customFraDato;
    tilDato = context.customTilDato;
  } else if (context.tidsvindu !== "tilpasset") {
    const antallMåneder = tidsvinduTilMåneder(context.tidsvindu);
    const datoer = beregnTidsvinduDatoer(antallMåneder);
    fraDato = datoer.fraDato;
    tilDato = datoer.tilDato;
  } else {
    // Tilpasset uten datoer satt - fall tilbake til 3 år
    const datoer = beregnTidsvinduDatoer(36);
    fraDato = datoer.fraDato;
    tilDato = datoer.tilDato;
  }

  // Beregn antall måneder fra differansen mellom datoene
  const tidsvinduIAntallMåneder = beregnMånederMellomDatoer(fraDato, tilDato);

  return {
    ...context,
    tidsvinduIAntallMåneder,
    fraDato,
    tilDato,
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
      onChange={(value) => setTidsvindu(value as TidsvinduPeriode)}
      className="bg-ax-bg-default rounded-lg w-fit"
    >
      <ToggleGroupItem value="6 måneder" label="6 mnd" />
      <ToggleGroupItem value="1 år" label="1 år" />
      <ToggleGroupItem value="3 år" label="3 år" />
      <ToggleGroupItem value="10 år" label="10 år" />
    </ToggleGroup>
  );
};

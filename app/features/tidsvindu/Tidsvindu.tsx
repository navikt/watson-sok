import { ToggleGroup } from "@navikt/ds-react";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { createContext, use, useState } from "react";

type TidsvinduPeriode = "6 måneder" | "1 år" | "3 år";

type TidsvinduContextType = {
  tidsvindu: TidsvinduPeriode;
  setTidsvindu: (tidsvindu: TidsvinduPeriode) => void;
};
const TidsvinduContext = createContext<TidsvinduContextType | null>(null);

/**
 * Holder styr på hvilket tidsvindu som skal vises i visualiseringer
 */
export const TidsvinduProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tidsvindu, setTidsvindu] = useState<TidsvinduPeriode>("3 år");
  return (
    <TidsvinduContext.Provider value={{ tidsvindu, setTidsvindu }}>
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
  return {
    ...context,
    tidsvinduIAntallMåneder:
      context.tidsvindu === "6 måneder"
        ? 6
        : context.tidsvindu === "1 år"
          ? 12
          : 36,
  };
};

/**
 * Lar brukeren velge hvor stort tidsvindu som skal vises i visualiseringer
 */
export const TidsvinduVelger = () => {
  const { tidsvindu, setTidsvindu } = useTidsvindu();
  return (
    <ToggleGroup
      variant="neutral"
      size="small"
      value={tidsvindu}
      aria-label="Velg tidsvindu"
      onChange={(value) => setTidsvindu(value as TidsvinduPeriode)}
      className="bg-ax-bg-default rounded-lg w-fit"
    >
      <ToggleGroupItem value="6 måneder" label="6 mnd" />
      <ToggleGroupItem value="1 år" label="1 år" />
      <ToggleGroupItem value="3 år" label="3 år" />
    </ToggleGroup>
  );
};

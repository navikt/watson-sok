"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type Feature = "oppslag-bruker" | "arbeidsgiveroversikt" | "statistikk" | null;

interface FeatureContextType {
  valgtFeature: Feature;
  setValgtFeature: (f: Feature) => void;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [valgtFeature, setValgtFeatureState] = useState<Feature>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initielt: sett feature fra URL
  useEffect(() => {
    const param = searchParams.get("feature") as Feature | null;
    if (param !== valgtFeature) {
      setValgtFeatureState(param);
    }
  }, [searchParams]);

  // Oppdater både state og URL når bruker velger feature
  const setValgtFeature = (feature: Feature) => {
    setValgtFeatureState(feature);

    const newParams = new URLSearchParams(searchParams);
    if (feature) {
      newParams.set("feature", feature);
    } else {
      newParams.delete("feature");
    }

    // Ikke legg til i historikk (bruk replace)
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  return (
    <FeatureContext.Provider value={{ valgtFeature, setValgtFeature }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (!context)
    throw new Error("useFeature must be used within a FeatureProvider");
  return context;
};

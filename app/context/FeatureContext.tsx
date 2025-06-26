"use client";
import { createContext, useContext, useState } from "react";

type Feature = "oppslag-bruker" | "arbeidsgiveroversikt" | "statistikk" | null;

interface FeatureContextType {
    valgtFeature: Feature;
    setValgtFeature: (f: Feature) => void;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider = ({ children }: { children: React.ReactNode }) => {
    const [valgtFeature, setValgtFeature] = useState<Feature>(null);

    return (
        <FeatureContext.Provider value={{ valgtFeature, setValgtFeature }}>
            {children}
        </FeatureContext.Provider>
    );
};

export const useFeature = () => {
    const context = useContext(FeatureContext);
    if (!context) throw new Error("useFeature must be used within a FeatureProvider");
    return context;
};

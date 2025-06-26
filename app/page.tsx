"use client";
import { useFeature } from "./context/FeatureContext";
import OppslagBruker from "./components/OppslagBruker";
import ArbeidsgiverOversikt from "./components/ArbeidsgiverOversikt";
import Info from "./components/Info";


export default function HomePage() {
    const { valgtFeature } = useFeature();

    return (
        <div>
            {!valgtFeature && <Info/>}
            {valgtFeature === "oppslag-bruker" && <OppslagBruker />}
            {valgtFeature === "arbeidsgiveroversikt" && <ArbeidsgiverOversikt />}
            {valgtFeature === "statistikk" && <p>Statistikk kommer snart</p>}
        </div>
    );
}
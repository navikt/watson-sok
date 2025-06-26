"use client";
import { useFeature } from "./context/FeatureContext";
import OppslagBruker from "./components/OppslagBruker";
import ArbeidsgiverOversikt from "./components/ArbeidsgiverOversikt";


export default function HomePage() {
    const { valgtFeature } = useFeature();

    return (
        <div>
            {!valgtFeature && <p>Velg et verktøy fra menyen.</p>}
            {valgtFeature === "oppslag-bruker" && <OppslagBruker />}
            {valgtFeature === "arbeidsgiveroversikt" && <ArbeidsgiverOversikt />}
            {valgtFeature === "statistikk" && <p>Statistikk kommer snart</p>}
        </div>
    );
}
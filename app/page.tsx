"use client";

import { Alert } from "@navikt/ds-react";
import { useFeature } from "../context/FeatureContext";
import ArbeidsgiverOversikt from "./components/ArbeidsgiverOversikt";
import Info from "./components/Info";
import OppslagBruker from "./components/OppslagBruker";

export default function HomePage() {
  const { valgtFeature } = useFeature();

  switch (valgtFeature) {
    case null:
      return <Info />;
    case "oppslag-bruker":
      return <OppslagBruker />;
    case "arbeidsgiveroversikt":
      return <ArbeidsgiverOversikt />;
    case "statistikk":
      return (
        <Alert variant="info" className="m-4">
          Statistikk kommer snart.
        </Alert>
      );
    default:
      return (
        <Alert variant="error" className="m-4">
          Ugyldig visning valgt. Gå tilbake til menyen.
        </Alert>
      );
  }
}

import { redirect } from "react-router";

import type { LoaderFunctionArgs } from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { hentSøkedataFraSession } from "~/søk/søkeinfoSession.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { ident, bekreftetBegrunnetTilgang, tilgang, harUtvidetTilgang } =
    await hentSøkedataFraSession(request);

  if (!ident || !tilgang) {
    return redirect(RouteConfig.INDEX);
  }

  if (bekreftetBegrunnetTilgang || tilgang === "OK") {
    return redirect(RouteConfig.OPPSLAG);
  }

  return {
    ident,
    bekreftetBegrunnetTilgang,
    tilgang,
    harUtvidetTilgang,
    grunnForBegrensetTilgang: mapGrunnForBegrensetTilgang(tilgang),
    erKode6Eller7EllerUtland: [
      "AVVIST_STRENGT_FORTROLIG_ADRESSE",
      "AVVIST_STRENGT_FORTROLIG_UTLAND",
      "AVVIST_FORTROLIG_ADRESSE",
    ].includes(tilgang),
    erSkjermetBruker: tilgang === "AVVIST_SKJERMING",
  };
}

const mapGrunnForBegrensetTilgang = (grunnForBegrensetTilgang: string) => {
  switch (grunnForBegrensetTilgang) {
    case "AVVIST_STRENGT_FORTROLIG_ADRESSE":
      return "brukeren har strengt fortrolig adresse";
    case "AVVIST_STRENGT_FORTROLIG_UTLAND":
      return "brukeren har strengt fortrolig adresse i utlandet";
    case "AVVIST_FORTROLIG_ADRESSE":
      return "brukeren har fortrolig adresse";
    case "AVVIST_GEOGRAFISK":
      return "du ikke har tilgang til brukerens geografiske område eller enhet";
    case "AVVIST_AVDOED":
    case "AVVIST_AVDØD":
      return "brukeren har vært død i mer enn x måneder";
    case "AVVIST_SKJERMING":
      return "brukeren er Nav-ansatt eller annen skjermet bruker";
    case "AVVIST_HABILITET":
      return "du ikke har tilgang til å se informasjon om deg selv eller dine nærmeste";
    case "AVVIST_VERGE":
      return "du er registrert som brukerens verge";
    case "AVVIST_MANGLENDE_DATA":
      return "manglende data i systemet gjør at vi ikke kan gi deg tilgang automatisk";
    case "AVVIST_PERSON_UTLAND":
      return "brukeren bor i utlandet";
    case "AVVIST_UKJENT_BOSTED":
      return "brukeren har ukjent bosted";
    default:
      return "en ukjent grunn";
  }
};

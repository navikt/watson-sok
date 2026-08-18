import { type LoaderFunctionArgs, data } from "react-router";

import { logger } from "~/logging/logging";
import { gjørOppslagApiRequest } from "~/oppslag/api/oppslagApiClient.server";
import { hentSøkedataFraSession } from "~/søk/søkeinfoSession.server";

import { AapMeldekortResponsSchema } from "./domene";

/**
 * Resource route for å hente AAP-meldekort (vedtak + perioder) for aktiv bruker.
 *
 * `/api/aap-meldekort`
 *
 * @returns Liste over AAP-vedtak med tilhørende meldekortperioder
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const søkedata = await hentSøkedataFraSession(request);

  if (!søkedata.ident) {
    return data(
      { error: "Ingen aktiv sesjon. Gjør et oppslag først." },
      { status: 401 },
    );
  }

  if (!søkedata.tilgang || søkedata.tilgang === "IKKE_FUNNET") {
    return data({ error: "Ingen tilgang til oppslaget." }, { status: 403 });
  }

  const url = new URL(request.url);
  const traceLogging = url.searchParams.get("traceLogging") === "true";
  const utvidet = url.searchParams.get("utvidet") === "true";

  logger.info("Henter AAP-meldekort");

  const aapMeldekort = await gjørOppslagApiRequest({
    ident: søkedata.ident,
    request,
    navCallId: crypto.randomUUID(),
    endepunkt: `/oppslag/aap-meldekort?utvidet=${utvidet}`,
    schema: AapMeldekortResponsSchema,
    ekstraherFraMock: (mockData) => mockData.aapMeldekort || [],
    traceLogging,
  });

  if (aapMeldekort.length > 0) {
    logger.info("Hentet AAP-meldekort", { antall: aapMeldekort.length });
  } else {
    logger.info("Ingen AAP-meldekort funnet");
  }

  return data(aapMeldekort, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

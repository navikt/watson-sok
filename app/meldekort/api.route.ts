import { type LoaderFunctionArgs, data } from "react-router";
import { logger } from "~/logging/logging";
import { gjørOppslagApiRequest } from "~/oppslag/api/oppslagApiClient.server";
import { hentSøkedataFraSession } from "~/søk/søkeinfoSession.server";
import { MeldekortResponsSchema } from "./domene";

const GYLDIGE_YTELSER = ["dagpenger"] as const;
type GyldigYtelse = (typeof GYLDIGE_YTELSER)[number];

function erGyldigYtelse(ytelse: string | null): ytelse is GyldigYtelse {
  return GYLDIGE_YTELSER.includes(ytelse as GyldigYtelse);
}

/**
 * Resource route for å hente meldekort for en gitt ytelse
 *
 * Skal kalles med query parameter `ytelse`, for eksempel:
 * `/api/meldekort?ytelse=dagpenger`
 *
 * @returns Liste over meldekort for den gitte ytelsen
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const ytelse = url.searchParams.get("ytelse");

  if (!erGyldigYtelse(ytelse)) {
    return data(
      {
        error: `Ugyldig eller manglende ytelse. Gyldige verdier: ${GYLDIGE_YTELSER.join(", ")}`,
      },
      { status: 400 },
    );
  }

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

  const traceLogging = url.searchParams.get("traceLogging") === "true";
  const utvidet = url.searchParams.get("utvidet") === "true";

  logger.info(`Henter meldekort for ${ytelse}`);

  const meldekort = await gjørOppslagApiRequest({
    ident: søkedata.ident,
    request,
    navCallId: crypto.randomUUID(),
    endepunkt: `/oppslag/meldekort?utvidet=${utvidet}`,
    schema: MeldekortResponsSchema,
    ekstraherFraMock: (mockData) => mockData.meldekort || [],
    traceLogging,
  });

  if (meldekort) {
    logger.info(`Hentet meldekort for ${ytelse}`, {
      antall: meldekort?.length,
    });
  } else {
    logger.info(`Ingen meldekort funnet for ${ytelse}`);
  }

  return data(meldekort, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

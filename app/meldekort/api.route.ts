import { type LoaderFunctionArgs, data } from "react-router";
import { hentSøkedataFraSession } from "~/søk/søkeinfoSession.server";
import { hentMeldekort } from "./api.server";

const GYLDIGE_YTELSER = ["dagpenger"] as const;
type GyldigYtelse = (typeof GYLDIGE_YTELSER)[number];

function erGyldigYtelse(ytelse: string | null): ytelse is GyldigYtelse {
  return GYLDIGE_YTELSER.includes(ytelse as GyldigYtelse);
}

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

  const meldekort = await hentMeldekort({
    ident: søkedata.ident,
    request,
    navCallId: crypto.randomUUID(),
    traceLogging,
    utvidet,
  });

  return data(meldekort, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

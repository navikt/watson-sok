import { getBackendOboToken } from "~/features/auth/access-token";
import {
  BACKEND_API_URL,
  skalBrukeMockdata,
} from "~/features/config/env.server";
import { logger } from "~/features/logging/logging";

type LoggBegrunnetTilgangArgs = {
  ident: string;
  begrunnelse: string;
  mangel: string;
  request: Request;
};
export async function loggBegrunnetTilgang({
  ident,
  mangel,
  begrunnelse,
  request,
}: LoggBegrunnetTilgangArgs) {
  if (skalBrukeMockdata) {
    return;
  }

  try {
    const oboToken = await getBackendOboToken(request);
    const response = await fetch(
      `${BACKEND_API_URL}/oppslag/begrunnet-tilgang`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${oboToken}`,
          "Content-Type": "application/json",
          "Nav-Call-Id": crypto.randomUUID(),
        },
        body: JSON.stringify({ ident, begrunnelse, mangel }),
      },
    );

    if (response.ok) {
      logger.info(
        `Begrunnet tilgang logget for oppslag på bruker med ident ${ident.substring(0, 6)} *****.`,
      );
    } else {
      throw new Error(
        `Kunne ikke loggføre begrunnelse for begrunnet tilgang til bruker med ident ${ident.substring(0, 6)} *****. Status: ${response.status} – ${await response.text()}`,
      );
    }
  } catch (error) {
    logger.error("⛔ Nettverksfeil mot begrunnet tilgangslogg:", { error });
    throw error;
  }
}

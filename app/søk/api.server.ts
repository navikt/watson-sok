import z from "zod";
import { getBackendOboToken } from "~/auth/access-token";
import { BACKEND_API_URL, skalBrukeMockdata } from "~/config/env.server";
import { logger } from "~/logging/logging";
import { getMockedResponseByFødselsnummer } from "~/test/mock.server";
import { EksistensOgTilgangSchema, type EksistensOgTilgang } from "./domene";

/**
 * Sjekker eksistens og tilgang til en gitt personident
 *
 * @returns Status for eksistens og tilgang
 *
 * @example
 * ```typescript
 * const navCallId = crypto.randomUUID();
 * const tilgang = await sjekkEksistensOgTilgang("12345678901", request, navCallId);
 * if (tilgang === "ok") {
 *   // Fortsett med å hente data
 * }
 * ```
 */
export async function sjekkEksistensOgTilgang({
  ident,
  request,
  navCallId,
  traceLogging,
}: BackendKallSignatur): Promise<EksistensOgTilgang> {
  if (skalBrukeMockdata) {
    const mockedResponse = await getMockedResponseByFødselsnummer(ident);
    if (!mockedResponse) {
      logger.error(`Fant ingen mocket match på fødselsnummer ${ident}`);
      return {
        tilgang: "IKKE_FUNNET",
        harUtvidetTilgang: false,
      };
    }
    logger.info(`Fant mocket match på fødselsnummer ${ident}`);
    return mockedResponse.tilgang;
  }

  const oboToken = await getBackendOboToken(request);

  try {
    const response = await fetch(`${BACKEND_API_URL}/oppslag/personbruker`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
        "Nav-Call-Id": navCallId,
        logg: traceLogging ? "true" : "false",
      },
      body: JSON.stringify({ ident }),
    });

    logger.info(
      `Bruker med ident ${ident.substring(0, 6)} ***** slått opp med status ${response.status}`,
      { traceId: navCallId },
    );

    if (response.status === 404) {
      return {
        tilgang: "IKKE_FUNNET",
        harUtvidetTilgang: false,
      };
    }

    const data = await response.json();
    const parsedData = EksistensOgTilgangSchema.safeParse(data);
    if (!parsedData.success) {
      throw new EksistensOgTilgangError(
        "Ugyldig data fra baksystem: " +
          JSON.stringify(z.treeifyError(parsedData.error), null, 2),
      );
    }

    return {
      tilgang: parsedData.data.tilgang,
      harUtvidetTilgang: parsedData.data.harUtvidetTilgang,
    };
  } catch (error) {
    if (error instanceof EksistensOgTilgangError) {
      throw error;
    }
    logger.error("⛔ Nettverksfeil mot baksystem:", { error });
    throw error;
  }
}

type BackendKallSignatur = {
  ident: string;
  request: Request;
  navCallId: string;
  traceLogging: boolean;
};

class EksistensOgTilgangError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EksistensOgTilgangError";
  }
}

import z from "zod";
import { BACKEND_API_URL, skalBrukeMockdata } from "~/config/env.server";
import { logger } from "~/features/logging/logging";
import type { MockOppslagBrukerRespons } from "~/test/domene";
import { getMockedResponseByFødselsnummer } from "~/test/mock.server";
import { getBackendOboToken } from "~/utils/access-token";
import { InntektInformasjonSchema, YtelserInformasjonSchema } from "./schemas";

type BackendKallSignatur = {
  ident: string;
  request: Request;
  navCallId: string;
  traceLogging: boolean;
};

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

/** Henter inntekter for en gitt ident */
export async function hentInntekter({
  ident,
  request,
  navCallId,
  traceLogging,
}: BackendKallSignatur) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: "/oppslag/inntekt",
    schema: InntektInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.inntektInformasjon,
    traceLogging,
  });
}

/** Henter ytelser for en gitt ident */
export async function hentYtelser({
  ident,
  request,
  navCallId,
  traceLogging,
  utvidet,
}: BackendKallSignatur & { utvidet: boolean }) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: `/oppslag/stønad?utvidet=${utvidet}`,
    schema: YtelserInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.stønader,
    traceLogging,
  });
}

type ApiRequestConfig<T> = {
  /** Identifikatoren (fødselsnummer etc) man vil slå opp */
  ident: string;
  /** Det innkommende request-objektet (brukes for å hente ut OBO-token) */
  request: Request;
  /** Unik ID for å korrelere alle API-kall i dette oppslaget */
  navCallId: string;
  /** API endepunkt-URL */
  endepunkt: `/${string}`;
  /** Zod schema for å parse responsen */
  schema: z.ZodSchema<T>;
  /** En funksjon som returnerer riktig del av mock-datagrunnlaget */
  ekstraherFraMock: (mockData: MockOppslagBrukerRespons) => T;
  /** Om trace-logging skal være på */
  traceLogging: boolean;
};

/**
 * Generisk funksjon for å gjøre en forespørsel mot oppslags-APIene
 *
 * @param config - Konfigurasjonsobjekt for API-forespørselen
 * @returns Parsede og validerte data fra APIet eller mock
 */
async function gjørOppslagApiRequest<T>({
  ident,
  request,
  navCallId,
  endepunkt,
  schema,
  ekstraherFraMock,
  traceLogging,
}: ApiRequestConfig<T>): Promise<T> {
  if (skalBrukeMockdata) {
    try {
      const mockedResponse = await getMockedResponseByFødselsnummer(ident);
      if (!mockedResponse) {
        throw new OppslagApiError("Ingen match på fødsels- eller D-nummer");
      }
      return ekstraherFraMock(mockedResponse);
    } catch (error) {
      logger.error("Mock data error:", { error });
      throw error;
    }
  }

  try {
    const oboToken = await getBackendOboToken(request);

    const response = await fetch(`${BACKEND_API_URL}${endepunkt}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
        "Nav-Call-Id": navCallId,
        logg: traceLogging ? "true" : "false",
      },
      body: JSON.stringify({ ident }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new OppslagApiError("Ingen match på fødsels- eller D-nummer");
      } else if (response.status === 403) {
        throw new OppslagApiError(
          "Du har ikke tilgang til å se denne personen",
        );
      }
      throw new OppslagApiError(
        `Feil fra baksystem. Status: ${response.status} – ${await response.text()}`,
      );
    }

    const rawData = await response.json();
    if (!rawData.data) {
      throw new Error(rawData.error);
    }
    const parsedData = schema.safeParse(rawData.data);

    if (!parsedData.success) {
      logger.error("Mottok ugyldig data fra baksystem", {
        error: z.treeifyError(parsedData.error),
      });
      throw new OppslagApiError(
        "Ugyldig data fra baksystem: " + z.treeifyError(parsedData.error),
      );
    }

    return parsedData.data;
  } catch (err: unknown) {
    if (err instanceof OppslagApiError) {
      throw err;
    }
    logger.error("⛔ Nettverksfeil mot baksystem:", { error: err });
    throw err;
  }
}

class OppslagApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OppslagApiError";
  }
}

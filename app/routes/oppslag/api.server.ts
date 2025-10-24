import type z from "zod";
import { BACKEND_API_URL, skalBrukeMockdata } from "~/config/env.server";
import { getMockedResponseByFødselsnummer } from "~/routes/oppslag/mock.server";
import { getBackendOboToken } from "~/utils/access-token";
import {
  ArbeidsgiverInformasjonSchema,
  InntektInformasjonSchema,
  PersonInformasjonSchema,
  YtelserInformasjonSchema,
  type OppslagBrukerRespons,
} from "./schemas";

type EksistensOgTilgangResponse =
  | "ok"
  | "partial"
  | "forbidden"
  | "not found"
  | "error";

/**
 * Sjekker eksistens og tilgang til en gitt personident
 *
 * @param ident - Fødselsnummer eller D-nummer
 * @param request - Request-objektet for å hente OBO-token
 * @param navCallId - Unik ID for å korrelere alle API-kall i dette oppslaget
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
export async function sjekkEksistensOgTilgang(
  ident: string,
  request: Request,
  navCallId: string,
): Promise<EksistensOgTilgangResponse> {
  if (skalBrukeMockdata) {
    return "ok";
  }

  const oboToken = await getBackendOboToken(request);

  try {
    const response = await fetch(`${BACKEND_API_URL}/oppslag/personbruker`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
        "Nav-Call-Id": navCallId,
      },
      body: JSON.stringify({ ident }),
    });

    console.info(
      `Bruker med ident ${ident.substring(0, 6)} ***** slått opp med status ${response.status} (nav-call-id: ${navCallId})`,
    );

    switch (response.status) {
      case 200:
        return "ok";
      case 206:
        return "partial";
      case 403:
        return "forbidden";
      case 404:
        return "not found";
      default:
        return "error";
    }
  } catch (error) {
    console.error("⛔ Nettverksfeil mot baksystem:", error);
    return "error";
  }
}

/** Henter personopplysninger for en gitt ident */
export async function hentPersonopplysninger(
  ident: string,
  request: Request,
  navCallId: string,
) {
  return gjørOppslagApiRequest(ident, request, navCallId, {
    endepunkt: "/oppslag/personopplysninger",
    schema: PersonInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.personInformasjon,
  });
}

/** Henter arbeidsgivere for en gitt ident */
export async function hentArbeidsforhold(
  ident: string,
  request: Request,
  navCallId: string,
) {
  return gjørOppslagApiRequest(ident, request, navCallId, {
    endepunkt: "/oppslag/arbeidsforhold",
    schema: ArbeidsgiverInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.arbeidsgiverInformasjon,
  });
}

/** Henter inntekter for en gitt ident */
export async function hentInntekter(
  ident: string,
  request: Request,
  navCallId: string,
) {
  return gjørOppslagApiRequest(ident, request, navCallId, {
    endepunkt: "/oppslag/inntekt",
    schema: InntektInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.inntektInformasjon,
  });
}

/** Henter ytelser for en gitt ident */
export async function hentYtelser(
  ident: string,
  request: Request,
  navCallId: string,
) {
  return gjørOppslagApiRequest(ident, request, navCallId, {
    endepunkt: "/oppslag/stønad",
    schema: YtelserInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.stønader,
  });
}

type ApiRequestConfig<T> = {
  /** API endepunkt-URL */
  endepunkt: `/${string}`;
  /** Zod schema for å parse responsen */
  schema: z.ZodSchema<T>;
  /** En funksjon som returnerer riktig del av mock-datagrunnlaget */
  ekstraherFraMock: (mockData: OppslagBrukerRespons) => T;
};

/**
 * Generisk funksjon for å gjøre en forespørsel mot oppslags-APIene
 *
 * @param ident - Identifikatoren (fødselsnummer etc) man vil slå opp
 * @param request - Det innkommende request-objektet (brukes for å hente ut OBO-token)
 * @param navCallId - Unik ID for å korrelere alle API-kall i dette oppslaget
 * @param config - Konfigurasjonsobjekt for API-forespørselen
 * @returns Parsede og validerte data fra APIet eller mock
 */
async function gjørOppslagApiRequest<T>(
  ident: string,
  request: Request,
  navCallId: string,
  config: ApiRequestConfig<T>,
): Promise<T> {
  const { endepunkt, schema, ekstraherFraMock } = config;

  if (skalBrukeMockdata) {
    try {
      const mockedResponse = await getMockedResponseByFødselsnummer(ident);
      return ekstraherFraMock(mockedResponse);
    } catch (error) {
      console.error("Mock data error:", error);
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
      console.error("Ugyldig data fra baksystem", parsedData.error.flatten());
      throw new Error("Ugyldig data fra baksystem");
    }

    return parsedData.data;
  } catch (err: unknown) {
    if (err instanceof OppslagApiError) {
      throw err;
    }
    console.error("⛔ Nettverksfeil mot baksystem:", err);
    throw err;
  }
}

class OppslagApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OppslagApiError";
  }
}

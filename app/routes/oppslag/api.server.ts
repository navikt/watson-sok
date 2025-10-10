import type z from "zod";
import { isProd } from "~/config/env.server";
import { getMockedResponseByFødselsnummer } from "~/routes/oppslag/mock.server";
import { getnavpersondataapiOboToken } from "~/utils/access-token";
import {
  ArbeidsgiverInformasjonSchema,
  InntektInformasjonSchema,
  PersonInformasjonSchema,
  StønaderInformasjonSchema,
  type OppslagBrukerRespons,
} from "./schemas";

type EksistensOgTilgangResponse = "ok" | "forbidden" | "not found" | "error";

/** Sjekker eksistens og tilgang til en gitt personident */
export async function sjekkEksistensOgTilgang(
  ident: string,
  request: Request,
): Promise<EksistensOgTilgangResponse> {
  if (!isProd) {
    return "ok";
  }

  const oboToken = await getnavpersondataapiOboToken(request);

  try {
    const response = await fetch(
      "http://nav-persondata-api/oppslag/personbruker",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${oboToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ident }),
      },
    );

    console.info(
      `Bruker med ident ${ident.substring(0, 6)}xxxxx slått opp med status ${response.status}`,
    );

    switch (response.status) {
      case 200:
        return "ok";
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
export async function hentPersonopplysninger(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/personopplysninger",
    schema: PersonInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.personInformasjon,
  });
}

/** Henter arbeidsgivere for en gitt ident */
export async function hentArbeidsforhold(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/arbeidsforhold",
    schema: ArbeidsgiverInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.arbeidsgiverInformasjon,
  });
}

/** Henter inntekter for en gitt ident */
export async function hentInntekter(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/inntekt",
    schema: InntektInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.inntektInformasjon,
  });
}

/** Henter stønader for en gitt ident */
export async function hentStønader(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/stønad",
    schema: StønaderInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.stønader,
  });
}

type ApiRequestConfig<T> = {
  /** API endepunkt-URL */
  endepunkt: string;
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
 * @param config - Konfigurasjonsobjekt for API-forespørselen
 * @returns Parsede og validerte data fra APIet eller mock
 */
async function gjørOppslagApiRequest<T>(
  ident: string,
  request: Request,
  config: ApiRequestConfig<T>,
): Promise<T> {
  const { endepunkt, schema, ekstraherFraMock } = config;

  if (!isProd) {
    try {
      const mockedResponse = await getMockedResponseByFødselsnummer(ident);
      return ekstraherFraMock(mockedResponse);
    } catch (error) {
      console.error("Mock data error:", error);
      throw error;
    }
  }

  try {
    const oboToken = await getnavpersondataapiOboToken(request);

    const response = await fetch(endepunkt, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
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

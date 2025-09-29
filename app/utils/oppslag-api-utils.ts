import type z from "zod";
import { isProd } from "~/config/env.server";
import { getMockedResponseByFødselsnummer } from "~/routes/oppslag/mock.server";
import type { OppslagBrukerRespons } from "~/routes/oppslag/schemas";
import { getnavpersondataapiOboToken } from "./access-token";

type ApiRequestConfig<T> = {
  /** API endepunkt-URL */
  endepunkt: string;
  /** Zod schema for å parse responsen */
  schema: z.ZodSchema<T>;
  /** En funksjon som returnerer riktig del av mock-datagrunnlaget */
  ekstraherFraMock: (mockData: OppslagBrukerRespons) => T;
  /** Override av body (default er { ident }) */
  body?: Record<string, unknown>;
};

/**
 * Generisk funksjon for å gjøre en forespørsel mot oppslags-APIene
 *
 * @param ident - Identifikatoren (fødselsnummer etc) man vil slå opp
 * @param request - Det innkommende request-objektet (brukes for å hente ut OBO-token)
 * @param config - Konfigurasjonsobjekt for API-forespørselen
 * @returns Parsede og validerte data fra APIet eller mock
 */
export async function gjørOppslagApiRequest<T>(
  ident: string,
  request: Request,
  config: ApiRequestConfig<T>,
): Promise<T | { error: string; status: number }> {
  const { endepunkt, schema, ekstraherFraMock } = config;

  // In development, return mock data
  if (!isProd) {
    try {
      const mockedResponse = await getMockedResponseByFødselsnummer(ident);
      return ekstraherFraMock(mockedResponse) as z.infer<typeof schema>;
    } catch (error) {
      console.error("Mock data error:", error);
      return {
        error: "Feil ved henting av mock data",
        status: 500,
      };
    }
  }

  // In production, make actual API request
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
        return {
          error: "Ingen match på fødsels- eller D-nummer",
          status: 404,
        };
      } else if (response.status === 403) {
        return {
          error: "Du har ikke tilgang til å se denne personen",
          status: 403,
        };
      }
      throw new Error(
        `Feil fra baksystem. Status: ${response.status} – ${await response.text()}`,
      );
    }

    const rawData = await response.json();
    const parsedData = schema.safeParse(rawData);

    if (!parsedData.success) {
      console.error("Ugyldig data fra baksystem", parsedData.error.flatten());
      return {
        error: "Ugyldig data fra baksystem",
        status: 500,
      };
    }

    return parsedData.data;
  } catch (err: unknown) {
    console.error("⛔ Nettverksfeil mot baksystem:", err);
    return {
      error: "Tilkoblingsfeil mot baksystem",
      status: 502,
    };
  }
}

import { isProd } from "~/config/env.server";
import { getMockedResponseByFødselsnummer } from "~/routes/oppslag/[ident]/mock.server";
import { getnavpersondataapiOboToken as getOboToken } from "~/utils/access-token";
import {
  OppslagBrukerResponsSchema,
  type OppslagBrukerRespons,
} from "./schemas";

type FetchIdentArgs = {
  ident: string;
  request: Request;
};
/**
 * Fetches information about a person
 *
 * Returns the information requested, or a generic error.
 *
 * If the method is called locally (in development), a mock response is returned
 */
export async function fetchIdent({ ident, request }: FetchIdentArgs) {
  const oboToken = await getOboToken(request);

  if (!isProd) {
    console.log("[UTVIKLING]: Returnerer mock-respons");
    return getMockedResponseByFødselsnummer(ident);
  }

  return getInfoFromBackend(oboToken, ident);
}

async function getInfoFromBackend(
  oboToken: string,
  ident: string,
): Promise<OppslagBrukerRespons | { error: string; status: number }> {
  try {
    const res = await fetch("http://nav-persondata-api/oppslag-bruker", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fnr: ident }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Feil fra baksystem: ${res.status} - ${errorText}`);
      return {
        error: errorText,
        status: res.status,
      };
    }

    const parsedData = OppslagBrukerResponsSchema.safeParse(await res.json());
    if (!parsedData.success) {
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

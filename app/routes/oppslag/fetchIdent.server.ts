import { gjørOppslagApiRequest } from "~/utils/oppslag-api-utils";
import {
  OppslagBrukerResponsSchema,
  type OppslagBrukerRespons,
} from "./schemas";

type FetchIdentArgs = {
  ident: string;
  request: Request;
};

/**
 * Henter all informasjon om en bruker
 *
 * Returnerer informasjonen som er spesifisert i skjemaet, eller en feil
 *
 * Hvis metoden kalles lokalt (i utvikling), returneres en mock-respons
 */
export async function fetchIdent({ ident, request }: FetchIdentArgs) {
  return gjørOppslagApiRequest<OppslagBrukerRespons>(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag-bruker",
    schema: OppslagBrukerResponsSchema,
    ekstraherFraMock: (mockData) => mockData,
    body: { fnr: ident },
  });
}

import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { MeldekortResponsSchema } from "./domene";

/** Henter meldekort for en gitt ident */
export async function hentMeldekort({
  ident,
  request,
  navCallId,
  traceLogging,
}: BackendKallSignatur) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: "/oppslag/meldekort",
    schema: MeldekortResponsSchema,
    ekstraherFraMock: (mockData) => mockData.meldekort,
    traceLogging,
  });
}

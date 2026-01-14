import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { MeldekortResponsSchema } from "./domene";

/** Henter meldekort for en gitt ident */
export async function hentMeldekort({
  ident,
  request,
  navCallId,
  traceLogging,
  utvidet,
}: BackendKallSignatur) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: `/oppslag/meldekort?utvidet=${utvidet}`,
    schema: MeldekortResponsSchema,
    ekstraherFraMock: (mockData) => mockData.meldekort,
    traceLogging,
  });
}

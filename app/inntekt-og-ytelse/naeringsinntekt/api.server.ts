import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { PensjonsgivendeInntektSchema } from "./domene";

/** Henter pensjonsgivende inntekt for en gitt ident */
export async function hentPensjonsgivendeInntekt({
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
    endepunkt: `/oppslag/pensjonsgivende-inntekt?utvidet=${utvidet}`,
    schema: PensjonsgivendeInntektSchema,
    ekstraherFraMock: (mockData) => mockData.pensjonsgivendeInntekt ?? [],
    traceLogging,
  });
}

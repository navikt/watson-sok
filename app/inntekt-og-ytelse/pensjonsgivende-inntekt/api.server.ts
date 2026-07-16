import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";

import { PensjonsgivendeInntektListeSchema } from "./domene";

/** Henter pensjonsgivende inntekt (næringsinntekt) fra Sigrun/Skatteetaten */
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
    schema: PensjonsgivendeInntektListeSchema,
    ekstraherFraMock: (mockData) => mockData.pensjonsgivendeInntekt ?? [],
    traceLogging,
  });
}

import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { InntektInformasjonSchema } from "./domene";

/** Henter inntekter for en gitt ident */
export async function hentInntekter({
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
    endepunkt: `/oppslag/inntekt?utvidet=${utvidet}`,
    schema: InntektInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.inntektInformasjon,
    traceLogging,
  });
}

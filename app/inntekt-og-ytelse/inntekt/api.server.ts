import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { InntektInformasjonSchema } from "./domene";

/** Henter inntekter for en gitt ident */
export async function hentInntekter({
  ident,
  request,
  navCallId,
  traceLogging,
}: BackendKallSignatur) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: "/oppslag/inntekt",
    schema: InntektInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.inntektInformasjon,
    traceLogging,
  });
}

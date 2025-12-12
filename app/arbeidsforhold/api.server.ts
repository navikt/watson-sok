import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { ArbeidsgiverInformasjonSchema } from "./domene";

/** Henter arbeidsgivere for en gitt ident */
export async function hentArbeidsforhold({
  ident,
  request,
  navCallId,
  traceLogging,
}: BackendKallSignatur) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: "/oppslag/arbeidsforhold",
    schema: ArbeidsgiverInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.arbeidsgiverInformasjon,
    traceLogging,
  });
}

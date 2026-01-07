import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { ArbeidsgiverInformasjonSchema } from "./domene";

/** Henter arbeidsgivere for en gitt ident */
export async function hentArbeidsforhold({
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
    endepunkt: `/oppslag/arbeidsforhold?utvidet=${utvidet}`,
    schema: ArbeidsgiverInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.arbeidsgiverInformasjon,
    traceLogging,
  });
}

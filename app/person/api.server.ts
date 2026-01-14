import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { PersonInformasjonSchema } from "./domene";

/** Henter personopplysninger for en gitt ident */
export async function hentPersonopplysninger({
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
    endepunkt: `/oppslag/personopplysninger?utvidet=${utvidet}`,
    schema: PersonInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.personInformasjon,
    traceLogging,
  });
}

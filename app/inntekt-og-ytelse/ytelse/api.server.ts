import { gjørOppslagApiRequest, type BackendKallSignatur } from "~/oppslag/api";
import { YtelserInformasjonSchema } from "./domene";

/** Henter ytelser for en gitt ident */
export async function hentYtelser({
  ident,
  request,
  navCallId,
  traceLogging,
  utvidet,
}: BackendKallSignatur & { utvidet: boolean }) {
  return gjørOppslagApiRequest({
    ident,
    request,
    navCallId,
    endepunkt: `/oppslag/stønad?utvidet=${utvidet}`,
    schema: YtelserInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.stønader,
    traceLogging,
  });
}

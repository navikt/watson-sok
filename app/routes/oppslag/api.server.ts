import { gjørOppslagApiRequest } from "~/utils/oppslag-api-utils";
import {
  ArbeidsgiverInformasjonSchema,
  InntektInformasjonSchema,
  PersonInformasjonSchema,
  StønaderInformasjonSchema,
} from "./schemas";

/** Henter personopplysninger for en gitt ident */
export async function hentPersonopplysninger(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/personopplysninger",
    schema: PersonInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.personInformasjon,
  });
}

/** Henter arbeidsgivere for en gitt ident */
export async function hentArbeidsgivere(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/arbeidsgiver",
    schema: ArbeidsgiverInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.arbeidsgiverInformasjon,
  });
}

/** Henter inntekter for en gitt ident */
export async function hentInntekter(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/inntekt",
    schema: InntektInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.inntektInformasjon,
  });
}

/** Henter stønader for en gitt ident */
export async function hentStønader(ident: string, request: Request) {
  return gjørOppslagApiRequest(ident, request, {
    endepunkt: "http://nav-persondata-api/oppslag/stonad",
    schema: StønaderInformasjonSchema,
    ekstraherFraMock: (mockData) => mockData.stønader,
  });
}

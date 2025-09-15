import z from "zod";
import { isProd } from "~/config/env.server";
import { getMockedResponseByFnr } from "~/routes/api/oppslag/mock";
import { getnavpersondataapiOboToken } from "~/utils/access-token";

type FetchIdentArgs = {
  ident: string;
  request: Request;
};
/**
 * Fetches information about a person
 *
 * Returns the information requested, or a generic error.
 *
 * If the method is called locally (in development), a mock response is returned
 */
export async function fetchIdent({ ident, request }: FetchIdentArgs) {
  const oboToken = await getnavpersondataapiOboToken(request);

  if (!isProd) {
    console.log("[UTVIKLING]: Returnerer mock-respons");
    return getMockedResponseByFnr(ident);
  }

  return fetchInfoFromBackend(oboToken, ident);
}

async function fetchInfoFromBackend(
  oboToken: string,
  ident: string,
): Promise<OppslagBrukerRespons | { error: string; status: number }> {
  try {
    const res = await fetch("http://nav-persondata-api/oppslag-bruker", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oboToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fnr: ident }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Feil fra baksystem: ${res.status} - ${errorText}`);
      return {
        error: errorText,
        status: res.status,
      };
    }

    const parsedData = OppslagBrukerResponsSchema.safeParse(await res.json());
    if (!parsedData.success) {
      return {
        error: "Ugyldig data fra baksystem",
        status: 500,
      };
    }

    return parsedData.data;
  } catch (err: unknown) {
    console.error("⛔ Nettverksfeil mot baksystem:", err);
    return {
      error: "Tilkoblingsfeil mot baksystem",
      status: 502,
    };
  }
}

const NotNullPeriodeSchema = z.object({
  fom: z.string(),
  tom: z.string(),
});

const StonadPeriodeSchema = z.object({
  periode: NotNullPeriodeSchema,
  beløp: z.string(),
  kilde: z.string(),
  info: z.string(),
});

const PersonInformasjonSchema = z.object({
  navn: z.string(),
  aktorId: z.string(),
  adresse: z.string(),
  familemedlemmer: z.record(z.string(), z.enum(["BARN", "GIFT"])),
  statsborgerskap: z.array(z.string()),
});

const StonadSchema = z.object({
  stonadType: z.string(),
  perioder: z.array(StonadPeriodeSchema),
});

const AnsettelsesDetaljSchema = z.object({
  type: z.string(),
  stillingsprosent: z.number(),
  antallTimerPrUke: z.number(),
  periode: NotNullPeriodeSchema,
  ytrke: z.string(),
});

const ArbeidsforholdSchema = z.object({
  arbeidsgiver: z.string(),
  organisasjonsnummer: z.string(),
  adresse: z.string(),
  ansettelsesDetaljer: z.array(AnsettelsesDetaljSchema),
});

const ArbeidsgiverInformasjonSchema = z.object({
  lopendeArbeidsforhold: z.array(ArbeidsforholdSchema),
  historikk: z.array(ArbeidsforholdSchema),
});

const InntektSchema = z.object({
  arbeidsgiver: z.string(),
  periode: z.string(),
  arbeidsforhold: z.string(),
  stillingsprosent: z.string(),
  lonnstype: z.string(),
  antall: z.string().nullable(),
  belop: z.string(),
  harFlereVersjoner: z.boolean(),
});

const InntektInformasjonSchema = z.object({
  loennsinntekt: z.array(InntektSchema),
  naringsInntekt: z.array(InntektSchema),
  pensjonEllerTrygd: z.array(InntektSchema),
  ytelseFraOffentlige: z.array(InntektSchema),
});

const OppslagBrukerResponsSchema = z.object({
  utrekkstidspunkt: z.string(),
  fodselsnr: z.string(),
  saksbehandlerIdent: z.string(),
  personInformasjon: PersonInformasjonSchema,
  stonadOversikt: z.array(StonadSchema),
  arbeidsgiverInformasjon: ArbeidsgiverInformasjonSchema,
  inntektInformasjon: InntektInformasjonSchema,
});

export type OppslagBrukerRespons = z.infer<typeof OppslagBrukerResponsSchema>;

import z from "zod";
import { ArbeidsgiverInformasjonSchema } from "~/features/arbeidsforhold/domene";
import { InntektInformasjonSchema } from "~/features/inntekt-og-ytelse/inntekt/domene";
import { YtelserInformasjonSchema } from "~/features/inntekt-og-ytelse/ytelse/domene";
import { PersonInformasjonSchema } from "~/features/person/domene";
import { EksistensOgTilgangSchema } from "~/features/søk/domene";

export const MockOppslagBrukerResponsSchema = z.object({
  tilgang: EksistensOgTilgangSchema,
  utrekkstidspunkt: z.string(),
  saksbehandlerIdent: z.string(),
  fødselsnummer: z.string(),
  personInformasjon: PersonInformasjonSchema.nullable(),
  arbeidsgiverInformasjon: ArbeidsgiverInformasjonSchema.nullable(),
  inntektInformasjon: InntektInformasjonSchema.nullable(),
  stønader: YtelserInformasjonSchema.nullable(),
});

export type MockOppslagBrukerRespons = z.infer<
  typeof MockOppslagBrukerResponsSchema
>;

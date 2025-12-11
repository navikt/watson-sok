import z from "zod";
import { ArbeidsgiverInformasjonSchema } from "~/features/arbeidsforhold/domene";
import { InntektInformasjonSchema } from "~/features/inntekt/domene";
import { PersonInformasjonSchema } from "~/features/person/domene";
import { EksistensOgTilgangSchema } from "~/features/søk/domene";
import { YtelserInformasjonSchema } from "~/features/ytelse/domene";

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

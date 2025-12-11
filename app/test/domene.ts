import z from "zod";
import { PersonInformasjonSchema } from "~/features/person/domene";
import { EksistensOgTilgangSchema } from "~/features/søk/domene";
import {
  ArbeidsgiverInformasjonSchema,
  InntektInformasjonSchema,
  YtelserInformasjonSchema,
} from "~/routes/oppslag/schemas";

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

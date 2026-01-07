import z from "zod";
import { ArbeidsgiverInformasjonSchema } from "~/arbeidsforhold/domene";
import { InntektInformasjonSchema } from "~/inntekt-og-ytelse/inntekt/domene";
import { YtelserInformasjonSchema } from "~/inntekt-og-ytelse/ytelse/domene";
import { MeldekortResponsSchema } from "~/meldekort/domene";
import { PersonInformasjonSchema } from "~/person/domene";
import { EksistensOgTilgangSchema } from "~/søk/domene";

export const MockOppslagBrukerResponsSchema = z.object({
  tilgang: EksistensOgTilgangSchema,
  utrekkstidspunkt: z.string(),
  saksbehandlerIdent: z.string(),
  fødselsnummer: z.string(),
  personInformasjon: PersonInformasjonSchema.nullable(),
  arbeidsgiverInformasjon: ArbeidsgiverInformasjonSchema.nullable(),
  inntektInformasjon: InntektInformasjonSchema.nullable(),
  meldekort: MeldekortResponsSchema.nullish(),
  stønader: YtelserInformasjonSchema.nullable(),
});

export type MockOppslagBrukerRespons = z.infer<
  typeof MockOppslagBrukerResponsSchema
>;

import z from "zod";

const ÅpenPeriodeSchema = z.object({
  fom: z.string(),
  tom: z.string().nullable(),
});

const LukketPeriodeSchema = z.object({
  fom: z.string(),
  tom: z.string(),
});

const StonadPeriodeSchema = z.object({
  periode: LukketPeriodeSchema,
  beløp: z.number(),
  kilde: z.string(),
  info: z.string().nullable(),
});

const YtelseSchema = z.object({
  stonadType: z.string(),
  perioder: z.array(StonadPeriodeSchema),
});

export type Ytelse = z.infer<typeof YtelseSchema>;

export const YtelserInformasjonSchema = z.array(YtelseSchema);

const AnsettelsesDetaljSchema = z.object({
  type: z.string(),
  stillingsprosent: z.number().nullable(),
  antallTimerPrUke: z.number().nullable(),
  periode: ÅpenPeriodeSchema,
  yrke: z.string().nullable(),
});

const ArbeidsforholdSchema = z.object({
  id: z.string().optional(),
  arbeidsgiver: z.string(),
  organisasjonsnummer: z.string(),
  ansettelsesDetaljer: z.array(AnsettelsesDetaljSchema),
});

export const ArbeidsgiverInformasjonSchema = z.object({
  løpendeArbeidsforhold: z.array(ArbeidsforholdSchema),
  historikk: z.array(ArbeidsforholdSchema),
});

export type ArbeidsgiverInformasjon = z.infer<
  typeof ArbeidsgiverInformasjonSchema
>;

const InntektSchema = z.object({
  arbeidsgiver: z.string().nullable(),
  periode: z.string(),
  arbeidsforhold: z.string(),
  stillingsprosent: z.string().nullable(),
  lønnstype: z.string().nullable(),
  antall: z.number().nullable(),
  beløp: z.number().nullable(),
  harFlereVersjoner: z.boolean(),
});

export const InntektInformasjonSchema = z.object({
  lønnsinntekt: z.array(InntektSchema),
  næringsinntekt: z.array(InntektSchema),
  pensjonEllerTrygd: z.array(InntektSchema),
  ytelseFraOffentlige: z.array(InntektSchema),
});

export type InntektInformasjon = z.infer<typeof InntektInformasjonSchema>;

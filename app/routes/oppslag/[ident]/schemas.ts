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

const PersonInformasjonSchema = z.object({
  navn: z.string(),
  aktorId: z.string().nullable(),
  adresse: z.string().nullable(),
  familemedlemmer: z.record(z.string(), z.enum(["BARN", "GIFT", "FAR", "MOR"])),
  statsborgerskap: z.array(z.string()),
  sivilstand: z.string().nullable(),
});

export type PersonInformasjon = z.infer<typeof PersonInformasjonSchema>;

const StonadSchema = z.object({
  stonadType: z.string(),
  perioder: z.array(StonadPeriodeSchema),
});

export type Stonad = z.infer<typeof StonadSchema>;

const AnsettelsesDetaljSchema = z.object({
  type: z.string(),
  stillingsprosent: z.number(),
  antallTimerPrUke: z.number(),
  periode: ÅpenPeriodeSchema,
  yrke: z.string().nullable(),
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
  arbeidsgiver: z.string().nullable(),
  periode: z.string(),
  arbeidsforhold: z.string(),
  stillingsprosent: z.string().nullable(),
  lonnstype: z.string().nullable(),
  antall: z.number().nullable(),
  belop: z.number().nullable(),
  harFlereVersjoner: z.boolean(),
});

const InntektInformasjonSchema = z.object({
  loennsinntekt: z.array(InntektSchema),
  naringsInntekt: z.array(InntektSchema),
  PensjonEllerTrygd: z.array(InntektSchema),
  YtelseFraOffentlige: z.array(InntektSchema),
});

export type InntektInformasjon = z.infer<typeof InntektInformasjonSchema>;

export const OppslagBrukerResponsSchema = z.object({
  utrekkstidspunkt: z.string(),
  saksbehandlerIdent: z.string(),
  fødselsnummer: z.string(),
  personInformasjon: PersonInformasjonSchema.nullable(),
  arbeidsgiverInformasjon: ArbeidsgiverInformasjonSchema.nullable(),
  inntektInformasjon: InntektInformasjonSchema.nullable(),
  stønader: z.array(StonadSchema),
});

export type OppslagBrukerRespons = z.infer<typeof OppslagBrukerResponsSchema>;

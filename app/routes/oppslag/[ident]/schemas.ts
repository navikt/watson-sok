import z from "zod";

const NavnSchema = z.object({
  fornavn: z.string(),
  mellomnavn: z.string().nullable(),
  etternavn: z.string(),
});

export type Navn = z.infer<typeof NavnSchema>;

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

const NorskAdresseSchema = z.object({
  adressenavn: z.string().nullish(),
  husnummer: z.string().nullish(),
  husbokstav: z.string().nullish(),
  postnummer: z.string().nullish(),
  kommunenummer: z.string().nullish(),
  poststed: z.string().nullish(),
});
export type NorskAdresse = z.infer<typeof NorskAdresseSchema>;

const UtenlandskAdresseSchema = z.object({
  adressenavnNummer: z.string().nullish(),
  bygningEtasjeLeilighet: z.string().nullish(),
  postboksNummerNavn: z.string().nullish(),
  postkode: z.string().nullish(),
  bySted: z.string().nullish(),
  regionDistriktOmråde: z.string().nullish(),
  landkode: z.string(),
});
export type UtenlandskAdresse = z.infer<typeof UtenlandskAdresseSchema>;

const AdresseSchema = z.object({
  norskAdresse: NorskAdresseSchema.nullish(),
  utenlandskAdresse: UtenlandskAdresseSchema.nullish(),
});
export type Adresse = z.infer<typeof AdresseSchema>;

const PersonInformasjonSchema = z.object({
  navn: NavnSchema,
  aktørId: z.string().nullable(),
  adresse: AdresseSchema.nullable(),
  familemedlemmer: z.record(z.string(), z.enum(["BARN", "GIFT", "FAR", "MOR"])),
  statsborgerskap: z.array(z.string()),
  sivilstand: z.string().nullable(),
  alder: z.number(),
});

export type PersonInformasjon = z.infer<typeof PersonInformasjonSchema>;

const StonadSchema = z.object({
  stonadType: z.string(),
  perioder: z.array(StonadPeriodeSchema),
});

export type Stonad = z.infer<typeof StonadSchema>;

const AnsettelsesDetaljSchema = z.object({
  type: z.string(),
  stillingsprosent: z.number().nullable(),
  antallTimerPrUke: z.number().nullable(),
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

const InntektInformasjonSchema = z.object({
  lønnsinntekt: z.array(InntektSchema),
  næringsinntekt: z.array(InntektSchema),
  pensjonEllerTrygd: z.array(InntektSchema),
  ytelseFraOffentlige: z.array(InntektSchema),
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

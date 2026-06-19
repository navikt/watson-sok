import z from "zod";

const NavnSchema = z.object({
  fornavn: z.string(),
  mellomnavn: z.string().nullable(),
  etternavn: z.string(),
});

export type Navn = z.infer<typeof NavnSchema>;

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

const NavKontorSchema = z.object({
  enhetId: z.number(),
  navn: z.string(),
  enhetNr: z.string(),
  type: z.string(),
});

export const PersonInformasjonSchema = z.object({
  navn: NavnSchema,
  aktørId: z.string().nullable(),
  adresse: AdresseSchema.nullable(),
  adresseBeskyttelse: z.enum([
    "UGRADERT",
    "FORTROLIG",
    "STRENGT_FORTROLIG",
    "STRENGT_FORTROLIG_UTLAND",
  ]),
  familemedlemmer: z.array(
    z.object({
      ident: z.string(),
      rolle: z.enum([
        "BARN",
        "MOR",
        "FAR",
        "MEDMOR",
        "GIFT",
        "UGIFT",
        "SKILT",
        "SEPARERT",
        "ENKE_ELLER_ENKEMANN",
        "REGISTRERT_PARTNER",
        "SEPARERT_PARTNER",
        "SKILT_PARTNER",
        "GJENLEVENDE_PARTNER",
        "Ukjent",
      ]),
      fornavn: z.string().nullable().optional(),
      mellomnavn: z.string().nullable().optional(),
      etternavn: z.string().nullable().optional(),
      fødselsdato: z.string().nullable().optional(),
      adresseBeskyttelse: z
        .enum([
          "UGRADERT",
          "FORTROLIG",
          "STRENGT_FORTROLIG",
          "STRENGT_FORTROLIG_UTLAND",
        ])
        .nullish(),
    }),
  ),
  statsborgerskap: z.array(z.string()),
  sivilstand: z.string().nullable(),
  alder: z.number(),
  fødselsdato: z.string(),
  dødsdato: z.string().nullable(),
  navKontor: NavKontorSchema.nullish(),
});

export type PersonInformasjon = z.infer<typeof PersonInformasjonSchema>;

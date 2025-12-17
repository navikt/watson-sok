import z from "zod";

const AktivitetTypeSchema = z.enum(["Arbeid", "Fravaer", "Syk", "Utdanning"]);

const AktivitetSchema = z.object({
  id: z.string(),
  type: AktivitetTypeSchema,
  timer: z.number().nullish(),
  dato: z.string().nullish(),
});

const DagSchema = z.object({
  dato: z.string(),
  aktiviteter: z.array(AktivitetSchema),
  dagIndex: z.number(),
});

const PeriodeSchema = z.object({
  fraOgMed: z.string(),
  tilOgMed: z.string(),
});

const KildeSchema = z.object({
  rolle: z.string(),
  ident: z.string(),
});

const MeldekortSchema = z.object({
  dager: z.array(DagSchema),
  id: z.string(),
  periode: PeriodeSchema,
  opprettetAv: z.string(),
  migrert: z.boolean(),
  kilde: KildeSchema,
  innsendtTidspunkt: z.string().nullish(),
  registrertArbeidssoker: z.boolean().nullish(),
  meldedato: z.string().nullish(),
});

export const MeldekortResponsSchema = z.array(MeldekortSchema);
export type MeldekortRespons = z.infer<typeof MeldekortResponsSchema>;

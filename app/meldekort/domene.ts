import z from "zod";

const AktivitetTypeSchema = z.enum(["Arbeid", "Fravaer", "Syk", "Utdanning"]);
export type AktivitetType = z.infer<typeof AktivitetTypeSchema>;

/**
 * Konverterer en ISO 8601-varighetsstreng (f.eks. "PT5H30M") til desimaltimer.
 * dp-datadeling returnerer timer som varighetsstrenger, ikke desimaltall.
 *
 * Eksempler: "PT5H30M" → 5.5, "PT6H" → 6, "PT45M" → 0.75
 */
export function parsePTDuration(duration: string): number {
  const match = duration.match(
    /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/,
  );
  if (!match) return 0;
  const hours = parseFloat(match[1] ?? "0");
  const minutes = parseFloat(match[2] ?? "0");
  const seconds = parseFloat(match[3] ?? "0");
  return hours + minutes / 60 + seconds / 3600;
}

const AktivitetSchema = z.object({
  id: z.string(),
  type: AktivitetTypeSchema,
  // dp-datadeling sender ISO 8601-varighetsstrenger (f.eks. "PT5H30M").
  // Lokale mocks bruker tall. Begge aksepteres — strenger transformeres til desimaltimer.
  timer: z.union([z.number(), z.string().transform(parsePTDuration)]).nullish(),
  dato: z.string().nullish(),
});

const DagSchema = z.object({
  dato: z.string(),
  aktiviteter: z.array(AktivitetSchema),
  dagIndex: z.number(),
});
export type Dag = z.infer<typeof DagSchema>;

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
  // Ikke alltid tilstede i produksjonsdata fra dp-datadeling.
  migrert: z.boolean().optional(),
  kilde: KildeSchema,
  innsendtTidspunkt: z.string().nullish(),
  registrertArbeidssoker: z.boolean().nullish(),
  meldedato: z.string().nullish(),
});

export const MeldekortResponsSchema = z.array(MeldekortSchema);
export type MeldekortRespons = z.infer<typeof MeldekortResponsSchema>;

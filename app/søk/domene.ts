import z from "zod";

export const EksistensOgTilgangSchema = z.object({
  tilgang: z.enum([
    "OK",
    "IKKE_FUNNET",
    "AVVIST_STRENGT_FORTROLIG_ADRESSE",
    "AVVIST_STRENGT_FORTROLIG_UTLAND",
    "AVVIST_FORTROLIG_ADRESSE",
    "AVVIST_GEOGRAFISK",
    "AVVIST_AVDOED",
    "AVVIST_AVDØD",
    "AVVIST_SKJERMING",
    "AVVIST_HABILITET",
    "AVVIST_VERGE",
    "AVVIST_MANGLENDE_DATA",
    "AVVIST_PERSON_UTLAND",
    "AVVIST_UKJENT_BOSTED",
  ]),
  harUtvidetTilgang: z.boolean(),
});

export type EksistensOgTilgang = z.infer<typeof EksistensOgTilgangSchema>;

import { z } from "zod";

const ÅpenPeriodeSchema = z.object({
  fom: z.string(),
  tom: z.string().nullable(),
});

const AnsettelsesDetaljSchema = z.object({
  type: z.string(),
  stillingsprosent: z.number().nullable(),
  antallTimerPrUke: z.number().nullable(),
  periode: ÅpenPeriodeSchema,
  yrke: z.string().nullable(),
});

/**
 * Timer rapportert for timelønnet-arbeid per rapporteringsperiode.
 * Eksponeres av nav-persondata-api når tilgjengelig fra AAREG.
 * Format for fraOgMed/tilOgMed: "YYYY-MM"
 */
const TimerMedTimeloennSchema = z.object({
  antall: z.number(),
  fraOgMed: z.string().optional(),
  tilOgMed: z.string().nullish(),
});

type TimerMedTimeloenn = z.infer<typeof TimerMedTimeloennSchema>;

const ArbeidsforholdSchema = z.object({
  id: z.string().optional(),
  arbeidsgiver: z.string(),
  organisasjonsnummer: z.string(),
  ansettelsesDetaljer: z.array(AnsettelsesDetaljSchema),
  /** Timelønnet-timer fra AAREG — eksponeres av nav-persondata-api (kommer i fremtidig backend-release) */
  timerMedTimeloenn: z.array(TimerMedTimeloennSchema).optional(),
});

export const ArbeidsgiverInformasjonSchema = z.object({
  løpendeArbeidsforhold: z.array(ArbeidsforholdSchema),
  historikk: z.array(ArbeidsforholdSchema),
});

export type ArbeidsgiverInformasjon = z.infer<
  typeof ArbeidsgiverInformasjonSchema
>;

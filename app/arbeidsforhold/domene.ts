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
 * Rapporteringsperiode på månedsnivå ("YYYY-MM") for en timerMedTimeloenn-
 * oppføring. Brukes som fallback-periode når startdato/sluttdato mangler
 * (Aareg rapporterer i så fall kun hvilken(e) måned(er) timene gjelder for,
 * ikke eksakte dager) — se beregnAaTimerForMåned i meldekort/utils.ts.
 */
const RapporteringsperiodeSchema = z.object({
  fom: z.string(),
  tom: z.string().nullable(),
});

/**
 * Timer rapportert for timelønnet-arbeid per opptjeningsperiode.
 * Eksponeres av nav-persondata-api fra AAREG.
 * Format for startdato/sluttdato: "YYYY-MM-DD"
 */
const TimerMedTimeloennSchema = z.object({
  antall: z.number(),
  startdato: z.string().nullable(),
  sluttdato: z.string().nullish(),
  rapporteringsmaaneder: RapporteringsperiodeSchema.nullish(),
});

export type TimerMedTimeloenn = z.infer<typeof TimerMedTimeloennSchema>;

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

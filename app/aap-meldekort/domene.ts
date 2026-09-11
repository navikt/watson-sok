import z from "zod";

const ÅpenPeriodeSchema = z.object({
  fraOgMed: z.string(),
  tilOgMed: z.string().nullish(),
});

const AapArbeidPerDagSchema = z.object({
  dag: z.string(),
  timerArbeidet: z.number(),
});
export type AapArbeidPerDag = z.infer<typeof AapArbeidPerDagSchema>;

const AapMeldekortPeriodeSchema = z.object({
  fraOgMed: z.string(),
  // Nullish: Kelvin returnerer null for å indikere en ÅPEN periode (løper
  // fra fraOgMed og videre uten kjent sluttdato) — samme konvensjon som
  // vedtakPeriode/ÅpenPeriodeSchema. Skal IKKE tolkes som en éndags-periode.
  tilOgMed: z.string().nullish(),
  arbeidetTimer: z.number().nullish(),
  annenReduksjon: z.number().nullish(),
  utbetalingsgrad: z.number().nullish(),
  // Dag-for-dag-nedbryting av arbeidetTimer, utledet av backend fra et eget
  // Holmes/AA-register-arbeidstimer-endepunkt (IKKE fra Kelvin direkte -
  // Kelvins /maksimum-endepunkt sender alltid null for dette). Kan være tom
  // hvis Holmes-endepunktet ikke har overlappende data for perioden.
  arbeidPerDag: z.array(AapArbeidPerDagSchema).default([]),
});
export type AapMeldekortPeriode = z.infer<typeof AapMeldekortPeriodeSchema>;

const AapVedtakSchema = z.object({
  vedtakId: z.string(),
  status: z.string(),
  saksnummer: z.string(),
  vedtakPeriode: ÅpenPeriodeSchema,
  rettighetsType: z.string(),
  kide: z.string(),
  tema: z.string(),
  vedtaktypeNavn: z.string().nullish(),
  perioder: z.array(AapMeldekortPeriodeSchema),
});
export type AapVedtak = z.infer<typeof AapVedtakSchema>;

export const AapMeldekortResponsSchema = z.array(AapVedtakSchema);
export type AapMeldekortRespons = z.infer<typeof AapMeldekortResponsSchema>;

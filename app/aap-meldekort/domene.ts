import z from "zod";

const ÅpenPeriodeSchema = z.object({
  fraOgMed: z.string(),
  tilOgMed: z.string().nullish(),
});

const AapMeldekortPeriodeSchema = z.object({
  fraOgMed: z.string(),
  // Nullish: Kelvin returnerer null for å indikere en ÅPEN periode (løper
  // fra fraOgMed og videre uten kjent sluttdato) — samme konvensjon som
  // vedtakPeriode/ÅpenPeriodeSchema. Skal IKKE tolkes som en éndags-periode.
  tilOgMed: z.string().nullish(),
  arbeidetTimer: z.number().nullish(),
  annenReduksjon: z.number().nullish(),
  utbetalingsgrad: z.number().nullish(),
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

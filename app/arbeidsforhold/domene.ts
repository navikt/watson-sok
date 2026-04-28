import { z } from "zod";

const isoDatoSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
  .refine((value) => {
    const dato = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(dato.getTime()) && dato.toISOString().slice(0, 10) === value
    );
  });

const ÅpenPeriodeSchema = z.object({
  fom: isoDatoSchema,
  tom: isoDatoSchema.nullable(),
});

const AnsettelsesDetaljSchema = z.object({
  type: z.string(),
  stillingsprosent: z.number().nullable(),
  antallTimerPrUke: z.number().nullable(),
  periode: ÅpenPeriodeSchema,
  yrke: z.string().nullable(),
});

const ArbeidsforholdSchema = z.object({
  id: z.string().optional(),
  arbeidsgiver: z.string(),
  organisasjonsnummer: z.string(),
  ansettelsesDetaljer: z.array(AnsettelsesDetaljSchema),
});

export const ArbeidsgiverInformasjonSchema = z.object({
  løpendeArbeidsforhold: z.array(ArbeidsforholdSchema),
  historikk: z.array(ArbeidsforholdSchema),
});

export type ArbeidsgiverInformasjon = z.infer<
  typeof ArbeidsgiverInformasjonSchema
>;

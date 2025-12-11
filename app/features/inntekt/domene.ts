import { z } from "zod";

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

export const InntektInformasjonSchema = z.object({
  lønnsinntekt: z.array(InntektSchema),
  næringsinntekt: z.array(InntektSchema),
  pensjonEllerTrygd: z.array(InntektSchema),
  ytelseFraOffentlige: z.array(InntektSchema),
});

export type InntektInformasjon = z.infer<typeof InntektInformasjonSchema>;

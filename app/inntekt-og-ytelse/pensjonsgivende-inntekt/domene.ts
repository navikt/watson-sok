import { z } from "zod";

const PensjonsgivendeInntektSchema = z.object({
  inntektsår: z.string(),
  næringsinntekt: z.number(),
  lønnsinntekt: z.number(),
});

export const PensjonsgivendeInntektListeSchema = z.array(
  PensjonsgivendeInntektSchema,
);

export type PensjonsgivendeInntekt = z.infer<
  typeof PensjonsgivendeInntektSchema
>;

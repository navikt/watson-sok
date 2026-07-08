import { z } from "zod";

export const PensjonsgivendeInntektPostSchema = z.object({
  inntektsår: z.string(),
  næringsinntekt: z.number(),
  lønnsinntekt: z.number(),
});

export const PensjonsgivendeInntektSchema = z.array(
  PensjonsgivendeInntektPostSchema,
);

export type PensjonsgivendeInntektPost = z.infer<
  typeof PensjonsgivendeInntektPostSchema
>;

import { z } from "zod";

export const NæringsinntektPostSchema = z.object({
  år: z.number(),
  beløp: z.number(),
});

export type NæringsinntektPost = z.infer<typeof NæringsinntektPostSchema>;

import type { NæringsinntektPost } from "./domene";

/** Henter næringsinntekt for en gitt ident (mock-implementasjon) */
export async function hentNæringsinntekt(): Promise<NæringsinntektPost[]> {
  const inneværendeÅr = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => ({
    år: inneværendeÅr - i,
    beløp: Math.round(200_000 + Math.random() * 300_000),
  }));
}

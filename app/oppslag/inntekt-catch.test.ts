import { describe, expect, it } from "vitest";

import { OppslagApiError } from "~/oppslag/api/errors";

const inntektCatch = (error: unknown): null => {
  if (error instanceof OppslagApiError) throw error;
  return null;
};

describe("inntekt graceful degradering i oppslagLoader", () => {
  it("returnerer null ved upstream baksystem-feil", async () => {
    const resultat = await Promise.reject(
      new Error("Feil fra baksystem"),
    ).catch(inntektCatch);
    expect(resultat).toBeNull();
  });

  it("lar OppslagApiError propagere (ikke catch skjema-/kodefeil)", async () => {
    await expect(
      Promise.reject(new OppslagApiError("Ugyldig data fra baksystem")).catch(
        inntektCatch,
      ),
    ).rejects.toBeInstanceOf(OppslagApiError);
  });
});

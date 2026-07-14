import { describe, expect, it } from "vitest";

import { BaksystemFeilError, OppslagApiError } from "~/oppslag/api/errors";

const inntektCatch = (error: unknown): null => {
  if (!(error instanceof BaksystemFeilError)) throw error;
  return null;
};

describe("inntekt catch-logikk — BaksystemFeilError", () => {
  it("returnerer null ved 5xx baksystem-feil", async () => {
    const resultat = await Promise.reject(new BaksystemFeilError(502)).catch(
      inntektCatch,
    );
    expect(resultat).toBeNull();
  });

  it("lar OppslagApiError propagere (skjema-feil, person ikke funnet, osv.)", async () => {
    await expect(
      Promise.reject(new OppslagApiError("Ugyldig data fra baksystem")).catch(
        inntektCatch,
      ),
    ).rejects.toBeInstanceOf(OppslagApiError);
  });
});

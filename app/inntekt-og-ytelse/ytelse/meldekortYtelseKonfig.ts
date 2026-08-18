/**
 * Sentralisert konfig for hvilke ytelsestyper som har meldekort-integrasjon,
 * og hvilken type meldekort-data de bruker. Én kilde for dette i stedet for
 * spredte hardkodede lister (YtelserPanel, YtelsedetaljerModal, api-routes).
 */
export type MeldekortYtelseType = "dagpenger" | "aap";

const YTELSE_TIL_MELDEKORTTYPE: Record<string, MeldekortYtelseType> = {
  dagpenger: "dagpenger",
  arbeidsavklaringspenger: "aap",
};

/** Returnerer meldekort-typen for en gitt stønadType, eller null om ytelsen ikke har meldekort-integrasjon. */
export function finnMeldekortYtelseType(
  stonadType: string,
): MeldekortYtelseType | null {
  return YTELSE_TIL_MELDEKORTTYPE[stonadType.toLowerCase()] ?? null;
}

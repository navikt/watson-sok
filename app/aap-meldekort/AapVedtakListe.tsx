import { BodyShort, Heading, Tag } from "@navikt/ds-react";

import { useAapMeldekort } from "~/aap-meldekort/AapMeldekortContext";
import { PanelContainer } from "~/paneler/PanelContainer";
import { formaterDato } from "~/utils/date-utils";

import type { AapVedtak } from "./domene";

const STATUS_TIL_TAG_VARIANT: Record<
  string,
  "success" | "neutral" | "warning"
> = {
  LØPENDE: "success",
  AVSLUTTET: "neutral",
  STANSET: "warning",
};

function statusTagVariant(status: string): "success" | "neutral" | "warning" {
  return STATUS_TIL_TAG_VARIANT[status] ?? "neutral";
}

/**
 * Viser en liste over AAP-vedtak med status, saksnummer, periode og
 * rettighetstype. Støttende detaljvisning til `AapOppsummeringPanel` —
 * viser IKKE egne grafer per vedtak (se `aggregerAapTimerPerMåned`).
 *
 * Forventer å bli rendret innenfor en `AapMeldekortProvider`.
 */
export function AapVedtakListe() {
  const aapState = useAapMeldekort();

  if (!aapState || aapState.status === "loading") {
    return null;
  }

  if (aapState.status === "error") {
    return (
      <PanelContainer title="AAP-vedtak">
        <BodyShort size="small">Kunne ikke hente AAP-vedtak</BodyShort>
      </PanelContainer>
    );
  }

  if (aapState.vedtak.length === 0) {
    return (
      <PanelContainer title="AAP-vedtak">
        <BodyShort size="small">Ingen AAP-vedtak funnet</BodyShort>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer title="AAP-vedtak">
      <div className="flex flex-col gap-4">
        {aapState.vedtak.map((vedtak) => (
          <AapVedtakKort key={vedtak.vedtakId} vedtak={vedtak} />
        ))}
      </div>
    </PanelContainer>
  );
}

function AapVedtakKort({ vedtak }: { vedtak: AapVedtak }) {
  return (
    <div className="border border-ax-border-neutral-subtle rounded-md p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-between">
        <Heading level="3" size="xsmall">
          Saksnummer {vedtak.saksnummer}
        </Heading>
        <Tag variant={statusTagVariant(vedtak.status)} size="small">
          {vedtak.status}
        </Tag>
      </div>
      <BodyShort size="small">
        {vedtak.rettighetsType}
        {vedtak.vedtaktypeNavn ? ` — ${vedtak.vedtaktypeNavn}` : ""}
      </BodyShort>
      <BodyShort size="small" textColor="subtle">
        {formaterDato(vedtak.vedtakPeriode.fraOgMed)} –{" "}
        {vedtak.vedtakPeriode.tilOgMed
          ? formaterDato(vedtak.vedtakPeriode.tilOgMed)
          : "pågår"}
      </BodyShort>
    </div>
  );
}

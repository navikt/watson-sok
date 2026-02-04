import { BodyShort, Label } from "@navikt/ds-react";
import { useId } from "react";

type StatistikkKortProps = {
  /** Ledetekst som vises over verdien */
  label: string;
  /** Hovedverdien som vises fremhevet */
  verdi: string;
  /** Valgfri tilleggstekst som vises under verdien */
  beskrivelse?: string;
};

/**
 * Kort som viser en statistikkverdi med ledetekst.
 * Brukes for å presentere nøkkeltall i oppsummeringspaneler.
 */
export function StatistikkKort({
  label,
  verdi,
  beskrivelse,
}: StatistikkKortProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const beskrivelseId = `${id}-beskrivelse`;

  return (
    <div className="rounded-lg border border-ax-neutral-200 bg-ax-surface-subtle p-4">
      <Label as="span" size="small" id={labelId}>
        {label}
      </Label>
      <BodyShort
        className="text-2xl font-semibold"
        spacing
        aria-labelledby={labelId}
        aria-describedby={beskrivelse ? beskrivelseId : undefined}
      >
        {verdi}
      </BodyShort>
      {beskrivelse && (
        <BodyShort size="small" id={beskrivelseId}>
          {beskrivelse}
        </BodyShort>
      )}
    </div>
  );
}

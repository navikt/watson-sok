import { BodyShort, Label, Skeleton } from "@navikt/ds-react";
import { useId } from "react";

type StatistikkKortProps = {
  /** Ledetekst som vises over verdien */
  label: string;
  /** Hovedverdien som vises fremhevet */
  verdi: string;
  /** Valgfri tilleggstekst som vises under verdien */
  beskrivelse?: string;
  /** Om kortet er i lastetilstand */
  isLoading?: boolean;
};

/**
 * Kort som viser en statistikkverdi med ledetekst.
 * Brukes for å presentere nøkkeltall i oppsummeringspaneler.
 */
export function StatistikkKort({
  label,
  verdi,
  beskrivelse,
  isLoading,
}: StatistikkKortProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const beskrivelseId = `${id}-beskrivelse`;

  if (isLoading) {
    return <StatistikkKortSkeleton />;
  }

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

/**
 * Skeleton-versjon av StatistikkKort for lastetilstand.
 */
function StatistikkKortSkeleton() {
  return (
    <div className="rounded-lg border border-ax-neutral-200 bg-ax-surface-subtle p-4">
      <Skeleton variant="text" width="50%" height="20px" className="mb-1" />
      <Skeleton variant="text" width="60%" height="32px" className="mb-2" />
    </div>
  );
}

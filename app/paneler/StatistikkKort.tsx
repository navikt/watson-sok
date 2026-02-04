import { BodyShort, Label } from "@navikt/ds-react";
import { useId } from "react";

type StatistikkKortProps = {
  label: string;
  verdi: string;
  beskrivelse?: string;
};

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

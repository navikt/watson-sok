import { ThumbDownIcon, ThumbUpIcon } from "@navikt/aksel-icons";
import { BodyShort, Button } from "@navikt/ds-react";
import { useState } from "react";
import { sporHendelse } from "~/analytics/analytics";
import { cn } from "~/utils/class-utils";

type FeedbackProps = {
  /** Navnet på funksjonaliteten man ønsker feedback på. Helst ett eller to ord */
  feature: string;
  className?: string;
};

/** En enkel feedback-modul som tracker tilbakemelding på en funksjonalitet. */
export function Feedback({ feature, className }: FeedbackProps) {
  const [harVurdert, setHarVurdert] = useState(false);
  if (harVurdert) {
    return (
      <BodyShort
        className="animate-feedback-fade-out"
        role="status"
        aria-live="polite"
      >
        Takk!
      </BodyShort>
    );
  }

  const lagVurderingshandler =
    (tilbakemelding: "nyttig" | "ikke nyttig") => () => {
      setHarVurdert(true);
      sporHendelse("tilbakemelding", {
        funksjonalitet: feature,
        tilbakemelding,
      });
    };

  return (
    <div className={cn("flex items-center gap-2 rounded-lg", className)}>
      <p className="sr-only">Hva synes du om denne funksjonaliteten?</p>
      <Button
        variant="tertiary"
        size="small"
        aria-label="Dette var nyttig"
        onClick={lagVurderingshandler("nyttig")}
      >
        <ThumbUpIcon aria-hidden="true" />
      </Button>
      <Button
        variant="tertiary"
        size="small"
        aria-label="Dette var ikke nyttig"
        onClick={lagVurderingshandler("ikke nyttig")}
      >
        <ThumbDownIcon aria-hidden="true" />
      </Button>
    </div>
  );
}

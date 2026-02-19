import { Accordion, Skeleton } from "@navikt/ds-react";
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@navikt/ds-react/Accordion";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import type { PensjonsgivendeInntektPost } from "~/inntekt-og-ytelse/naeringsinntekt/domene";
import { NæringsinntektTabell } from "~/inntekt-og-ytelse/naeringsinntekt/NæringsinntektTabell";
import type { Ytelse } from "~/inntekt-og-ytelse/ytelse/domene";
import { PanelContainer } from "~/paneler/PanelContainer";
import type { InntektInformasjon } from "./domene";
import { InntektPanel, InntektPanelInnhold } from "./InntektPanel";

type InntektOgNæringsinntektPanelProps = {
  promise: Promise<InntektInformasjon | null>;
  ytelserPromise: Promise<Ytelse[] | null>;
  næringsinntektPromise: Promise<PensjonsgivendeInntektPost[]>;
  panelId?: string;
  ariaKeyShortcuts?: string;
};

/** Panel som viser inntekt og næringsinntekt – styrt av feature toggle */
export function InntektOgNæringsinntektPanel({
  promise,
  ytelserPromise,
  næringsinntektPromise,
  panelId,
  ariaKeyShortcuts,
}: InntektOgNæringsinntektPanelProps) {
  const visNæringsinntekt = useEnkeltFeatureFlagg(FeatureFlagg.NAERINGSINNTEKT);

  if (!visNæringsinntekt) {
    return (
      <InntektPanel
        promise={promise}
        ytelserPromise={ytelserPromise}
        panelId={panelId}
        ariaKeyShortcuts={ariaKeyShortcuts}
      />
    );
  }

  return (
    <PanelContainer
      title="Inntekt"
      id={panelId}
      aria-keyshortcuts={ariaKeyShortcuts}
    >
      <Accordion>
        <AccordionItem>
          <AccordionHeader>Lønnsinntekt</AccordionHeader>
          <AccordionContent>
            <ResolvingComponent
              loadingFallback={<Skeleton variant="rounded" height="10rem" />}
            >
              <InntektPanelInnhold
                promise={promise}
                ytelserPromise={ytelserPromise}
              />
            </ResolvingComponent>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>Næringsinntekt</AccordionHeader>
          <AccordionContent>
            <NæringsinntektTabell promise={næringsinntektPromise} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </PanelContainer>
  );
}

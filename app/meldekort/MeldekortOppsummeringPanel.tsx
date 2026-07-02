import { InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyShort, Skeleton } from "@navikt/ds-react";
import { use, useMemo } from "react";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { MeldekortProvider, useMeldekort } from "~/meldekort/MeldekortContext";
import { TimerSammenligningGraf } from "~/meldekort/TimerSammenligningGraf";
import { aggregerTimerPerMåned } from "~/meldekort/utils";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { useTidsvindu } from "~/tidsvindu/Tidsvindu";
import { formaterDato, formaterTilIsoDato } from "~/utils/date-utils";

type Props = {
  arbeidsgiverInformasjonPromise: Promise<ArbeidsgiverInformasjon | null>;
  /** Overskriver tidsvindu — brukes når panelet er knyttet til en ytelse med kjent periode */
  fraDato?: string;
  tilDato?: string;
};

/**
 * Viser sammenstilling av meldekort-timer og AA-registrerte timer som stolpediagram.
 * Panelet er synlig på hovedsiden og vises kun når feature-flagget er aktivt.
 */
export function MeldekortOppsummeringPanel({
  arbeidsgiverInformasjonPromise,
  fraDato,
  tilDato,
}: Props) {
  const erAktivert = useEnkeltFeatureFlagg(FeatureFlagg.RELEASE_1_2);

  if (!erAktivert) return null;

  return (
    <ResolvingComponent
      loadingFallback={
        <PanelContainerSkeleton title="AA-timer vs meldekort-timer per måned">
          <Skeleton variant="rounded" height={240} className="w-full" />
        </PanelContainerSkeleton>
      }
    >
      <MeldekortOppsummeringPanelMedData
        arbeidsgiverInformasjonPromise={arbeidsgiverInformasjonPromise}
        fraDato={fraDato}
        tilDato={tilDato}
      />
    </ResolvingComponent>
  );
}

type MedDataProps = {
  arbeidsgiverInformasjonPromise: Promise<ArbeidsgiverInformasjon | null>;
  fraDato?: string;
  tilDato?: string;
};

function MeldekortOppsummeringPanelMedData({
  arbeidsgiverInformasjonPromise,
  fraDato,
  tilDato,
}: MedDataProps) {
  const arbeidsgiverInformasjon = use(arbeidsgiverInformasjonPromise);

  return (
    <MeldekortProvider ytelse="dagpenger">
      <MeldekortOppsummeringPanelInnhold
        arbeidsgiverInformasjon={arbeidsgiverInformasjon}
        fraDato={fraDato}
        tilDato={tilDato}
      />
    </MeldekortProvider>
  );
}

type MeldekortOppsummeringPanelInnholdProps = {
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon | null;
  fraDato?: string;
  tilDato?: string;
};

function MeldekortOppsummeringPanelInnhold({
  arbeidsgiverInformasjon,
  fraDato: fraDatoProp,
  tilDato: tilDatoProp,
}: MeldekortOppsummeringPanelInnholdProps) {
  const meldekortState = useMeldekort();
  const {
    tidsvindu,
    fraDato: fraDatoTidsvindu,
    tilDato: tilDatoTidsvindu,
  } = useTidsvindu();

  const fraDatoDate = fraDatoProp ? new Date(fraDatoProp) : fraDatoTidsvindu;
  const tilDatoDate = tilDatoProp ? new Date(tilDatoProp) : tilDatoTidsvindu;

  const fraDato = formaterTilIsoDato(fraDatoDate);
  const tilDato = formaterTilIsoDato(tilDatoDate);

  const antallMeldekort = useMemo(() => {
    if (!meldekortState || meldekortState.status !== "success") return null;
    return meldekortState.meldekort.length;
  }, [meldekortState]);

  const timerData = useMemo(() => {
    if (
      !arbeidsgiverInformasjon ||
      !meldekortState ||
      meldekortState.status !== "success"
    )
      return null;
    return aggregerTimerPerMåned(
      meldekortState.meldekort,
      arbeidsgiverInformasjon,
      fraDato,
      tilDato,
    );
  }, [arbeidsgiverInformasjon, meldekortState, fraDato, tilDato]);

  const laster = !meldekortState || meldekortState.status === "loading";
  const harFeil = meldekortState?.status === "error";

  const periodeText = fraDatoProp
    ? `fra ${formaterDato(fraDato)}`
    : `siste ${tidsvindu}`;

  return (
    <PanelContainer title="AA-timer vs meldekort-timer per måned">
      <div className="flex flex-col gap-4">
        {/* Blå infopølse med antall meldekort */}
        <div className="flex items-center gap-2 rounded-full px-4 py-2 w-fit bg-[var(--ax-bg-brand-blue-moderate)]">
          <InformationSquareIcon
            aria-hidden
            className="text-[var(--ax-text-brand-blue-strong)] shrink-0"
          />
          {laster ? (
            <Skeleton width={200} height={20} />
          ) : harFeil ? (
            <BodyShort className="text-[var(--ax-text-brand-blue-strong)] font-medium">
              Kunne ikke hente meldekort
            </BodyShort>
          ) : (
            <BodyShort className="text-[var(--ax-text-brand-blue-strong)] font-medium">
              {antallMeldekort ?? 0} meldekort levert {periodeText}
            </BodyShort>
          )}
        </div>

        {/* Timer-sammenstilling graf */}
        {laster && (
          <Skeleton variant="rounded" height={240} className="w-full" />
        )}
        {!laster && !harFeil && timerData && timerData.length > 0 && (
          <>
            <BodyShort size="small" className="text-[var(--ax-text-subtle)]">
              Avvik mellom AA-registrerte timer og timer oppgitt i meldekort kan
              indikere feilutbetaling.
            </BodyShort>
            <TimerSammenligningGraf data={timerData} />
          </>
        )}
        {!laster && !harFeil && (!timerData || timerData.length === 0) && (
          <BodyShort className="text-[var(--ax-text-subtle)]">
            Ingen timer å vise for valgt periode.
          </BodyShort>
        )}
      </div>
    </PanelContainer>
  );
}

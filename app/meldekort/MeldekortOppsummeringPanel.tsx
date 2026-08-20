import { Alert, BodyShort, Skeleton } from "@navikt/ds-react";
import { use, useMemo } from "react";

import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { useMeldekort } from "~/meldekort/MeldekortContext";
import { TimerSammenligningGraf } from "~/meldekort/TimerSammenligningGraf";
import { aggregerTimerPerMåned } from "~/meldekort/utils";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { useTidsvindu } from "~/tidsvindu/Tidsvindu";
import { formaterTilIsoDato } from "~/utils/date-utils";

/** Maks antall måneder som vises i grafen uten scroll/utvidelse. */
const MAKS_MÅNEDER_I_GRAF = 12;

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
    <MeldekortOppsummeringPanelInnhold
      arbeidsgiverInformasjon={arbeidsgiverInformasjon}
      fraDato={fraDato}
      tilDato={tilDato}
    />
  );
}

type MeldekortOppsummeringPanelInnholdProps = {
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon | null;
  fraDato?: string;
  tilDato?: string;
};

/**
 * Innholdskomponent for AA-timer vs meldekort-sammenstilling.
 * Eksportert for testbarhet — bruk `MeldekortOppsummeringPanel` i produksjonskode.
 *
 * Merk: forventer å bli rendret innenfor en `MeldekortProvider` satt opp av
 * kallende kode (f.eks. `YtelsedetaljerModal`) — oppretter ikke sin egen.
 */
export function MeldekortOppsummeringPanelInnhold({
  arbeidsgiverInformasjon,
  fraDato: fraDatoProp,
  tilDato: tilDatoProp,
}: MeldekortOppsummeringPanelInnholdProps) {
  const meldekortState = useMeldekort();
  const { fraDato: fraDatoTidsvindu, tilDato: tilDatoTidsvindu } =
    useTidsvindu();

  const fraDatoDate = fraDatoProp ? new Date(fraDatoProp) : fraDatoTidsvindu;
  const tilDatoDate = tilDatoProp ? new Date(tilDatoProp) : tilDatoTidsvindu;

  const fraDato = formaterTilIsoDato(fraDatoDate);
  // Grafen skal aldri vise fremtidige måneder — klipp til inneværende måned.
  const tilDato = formaterTilIsoDato(
    tilDatoDate > new Date() ? new Date() : tilDatoDate,
  );

  const timerData = useMemo(() => {
    if (
      !arbeidsgiverInformasjon ||
      !meldekortState ||
      meldekortState.status !== "success"
    )
      return null;
    const alleMåneder = aggregerTimerPerMåned(
      meldekortState.meldekort,
      arbeidsgiverInformasjon,
      fraDato,
      tilDato,
    );
    // Vis maks de siste MAKS_MÅNEDER_I_GRAF månedene — kortere perioder
    // vises i sin helhet siden slice(-N) på et kortere array er en no-op.
    return alleMåneder.slice(-MAKS_MÅNEDER_I_GRAF);
  }, [arbeidsgiverInformasjon, meldekortState, fraDato, tilDato]);

  const antallMånederMedAvvik = useMemo(
    () => timerData?.filter((d) => d.harAvvik).length ?? 0,
    [timerData],
  );

  const laster = !meldekortState || meldekortState.status === "loading";
  const harFeil = meldekortState?.status === "error";
  const harTimer = timerData?.some((d) => d.mkTimer > 0 || d.aaTimer > 0) ?? false;

  return (
    <PanelContainer title="AA-timer vs meldekort-timer per måned">
      <div className="flex flex-col gap-4">
        {!laster && !harFeil && antallMånederMedAvvik > 0 && (
          <Alert variant="warning" size="small">
            {antallMånederMedAvvik === 1
              ? "1 periode med avvik mellom meldekort og AA-registreringen"
              : `${antallMånederMedAvvik} perioder med avvik mellom meldekort og AA-registreringen`}
          </Alert>
        )}

        {harFeil && (
          <Alert variant="error" size="small" inline>
            Kunne ikke hente meldekort
          </Alert>
        )}

        {/* Timer-sammenstilling graf */}
        {laster && (
          <Skeleton variant="rounded" height={240} className="w-full" />
        )}
        {!laster && !harFeil && !arbeidsgiverInformasjon && (
          <Alert variant="info" size="small" inline>
            Ingen data tilgjengelig for valgt periode.
          </Alert>
        )}
        {!laster && !harFeil && arbeidsgiverInformasjon && harTimer && (
          <>
            <BodyShort size="small">
              Avvik mellom AA-registrerte timer og timer oppgitt i meldekort
              kan indikere feilutbetaling.
            </BodyShort>
            <TimerSammenligningGraf data={timerData!} />
          </>
        )}
        {!laster && !harFeil && arbeidsgiverInformasjon && !harTimer && (
          <Alert variant="info" size="small" inline>
            Ingen data tilgjengelig for valgt periode.
          </Alert>
        )}
      </div>
    </PanelContainer>
  );
}

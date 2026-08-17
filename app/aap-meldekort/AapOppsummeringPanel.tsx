import { Alert, BodyShort, Skeleton } from "@navikt/ds-react";
import { use, useMemo } from "react";

import { useAapMeldekort } from "~/aap-meldekort/AapMeldekortContext";
import type { ArbeidsgiverInformasjon } from "~/arbeidsforhold/domene";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import { TimerSammenligningGraf } from "~/meldekort/TimerSammenligningGraf";
import { aggregerAapTimerPerMåned, erTimelønnet } from "~/meldekort/utils";
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
  fraDato?: string;
  tilDato?: string;
};

/**
 * Viser sammenstilling av AAP-meldekort-timer (arbeidetTimer, aggregert på
 * tvers av alle vedtak) og AA-registrerte timer som stolpediagram.
 *
 * Sammenligningen skjer på PERSON-/månedsnivå, ikke per vedtak — se
 * `aggregerAapTimerPerMåned` for begrunnelse.
 */
export function AapOppsummeringPanel({
  arbeidsgiverInformasjonPromise,
  fraDato,
  tilDato,
}: Props) {
  return (
    <ResolvingComponent
      loadingFallback={
        <PanelContainerSkeleton title="AA-timer vs AAP-meldekort-timer per måned">
          <Skeleton variant="rounded" height={240} className="w-full" />
        </PanelContainerSkeleton>
      }
    >
      <AapOppsummeringPanelMedData
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

function AapOppsummeringPanelMedData({
  arbeidsgiverInformasjonPromise,
  fraDato,
  tilDato,
}: MedDataProps) {
  const arbeidsgiverInformasjon = use(arbeidsgiverInformasjonPromise);

  return (
    <AapOppsummeringPanelInnhold
      arbeidsgiverInformasjon={arbeidsgiverInformasjon}
      fraDato={fraDato}
      tilDato={tilDato}
    />
  );
}

type InnholdProps = {
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon | null;
  fraDato?: string;
  tilDato?: string;
};

/**
 * Innholdskomponent for AA-timer vs AAP-meldekort-sammenstilling.
 * Eksportert for testbarhet — bruk `AapOppsummeringPanel` i produksjonskode.
 *
 * Forventer å bli rendret innenfor en `AapMeldekortProvider` satt opp av
 * kallende kode.
 */
export function AapOppsummeringPanelInnhold({
  arbeidsgiverInformasjon,
  fraDato: fraDatoProp,
  tilDato: tilDatoProp,
}: InnholdProps) {
  const aapState = useAapMeldekort();
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
    if (!arbeidsgiverInformasjon || !aapState || aapState.status !== "success")
      return null;
    const alleMåneder = aggregerAapTimerPerMåned(
      aapState.vedtak,
      arbeidsgiverInformasjon,
      fraDato,
      tilDato,
    );
    return alleMåneder.slice(-MAKS_MÅNEDER_I_GRAF);
  }, [arbeidsgiverInformasjon, aapState, fraDato, tilDato]);

  const antallMånederMedAvvik = useMemo(
    () => timerData?.filter((d) => d.harAvvik).length ?? 0,
    [timerData],
  );

  const laster = !aapState || aapState.status === "loading";
  const harFeil = aapState?.status === "error";
  const erTimelønnetBruker =
    arbeidsgiverInformasjon != null && erTimelønnet(arbeidsgiverInformasjon);
  // Uten vedtak/meldekortperioder blir mkTimer alltid 0, som gjør at grafen
  // ville vist "0t meldekort-timer" hver måned — ser ut som 100% avvik, men
  // er egentlig bare fravær av data. Vis grafen kun når det faktisk finnes
  // AAP-vedtak å sammenligne mot.
  const harAapVedtak =
    aapState?.status === "success" && aapState.vedtak.length > 0;

  return (
    <PanelContainer title="AA-timer vs AAP-meldekort-timer per måned">
      <div className="flex flex-col gap-4">
        {!laster && !harFeil && antallMånederMedAvvik > 0 && (
          <Alert variant="warning" size="small">
            {antallMånederMedAvvik === 1
              ? "1 periode med avvik mellom AAP-meldekort og AA-registreringen"
              : `${antallMånederMedAvvik} perioder med avvik mellom AAP-meldekort og AA-registreringen`}
          </Alert>
        )}

        {harFeil && (
          <Alert variant="error" size="small" inline>
            Kunne ikke hente AAP-meldekort
          </Alert>
        )}

        {laster && (
          <Skeleton variant="rounded" height={240} className="w-full" />
        )}
        {!laster && !harFeil && arbeidsgiverInformasjon == null && (
          <Alert variant="info" size="small" inline>
            Ingen data tilgjengelig for valgt periode.
          </Alert>
        )}
        {!laster &&
          !harFeil &&
          arbeidsgiverInformasjon != null &&
          !erTimelønnetBruker && (
            <Alert variant="info" size="small" inline>
              Ingen timer fra AA-registeret å vise. Timer vises kun for
              timelønnede.
            </Alert>
          )}
        {!laster &&
          !harFeil &&
          erTimelønnetBruker &&
          harAapVedtak &&
          timerData &&
          timerData.length > 0 && (
            <>
              <BodyShort size="small">
                Avvik mellom AA-registrerte timer og arbeidet timer oppgitt i
                AAP-meldekort kan indikere feilutbetaling.
              </BodyShort>
              <TimerSammenligningGraf data={timerData} />
            </>
          )}
        {!laster &&
          !harFeil &&
          erTimelønnetBruker &&
          (!harAapVedtak || !timerData || timerData.length === 0) && (
            <Alert variant="info" size="small" inline>
              Ingen data tilgjengelig for valgt periode.
            </Alert>
          )}
      </div>
    </PanelContainer>
  );
}

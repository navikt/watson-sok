import { Alert, Skeleton, ToggleGroup } from "@navikt/ds-react";
import { ToggleGroupItem } from "@navikt/ds-react/ToggleGroup";
import { use, useMemo, useState } from "react";
import { ResolvingComponent } from "../../async/ResolvingComponent";
import { PanelContainer, PanelContainerSkeleton } from "../PanelContainer";
import { GrafLegend } from "./GrafLegend";
import { HoverInfoboks } from "./HoverInfoboks";
import { Linjegraf } from "./Linjegraf";
import { SkjultTabell } from "./SkjultTabell";
import { Stolpediagram } from "./Stolpediagram";
import { ANTALL_MÅNEDER_BACK, GRAF_HØYDE } from "./konstanter";
import type {
  GrafData,
  GrafVisning,
  InntektOgYtelseOverlappPanelProps,
} from "./typer";
import { transformTilMånedligData } from "./utils";

/**
 * Laster inn og viser inntekt- og ytelsesdata som enten linjegraf eller stolpediagram.
 *
 * @example
 * <InntektOgYtelseOverlappPanel inntektPromise={inntektPromise} ytelserPromise={ytelserPromise} />
 */
export function InntektOgYtelseOverlappPanel({
  inntektPromise,
  ytelserPromise,
}: InntektOgYtelseOverlappPanelProps) {
  return (
    <ResolvingComponent
      loadingFallback={<InntektOgYtelseOverlappPanelSkeleton />}
    >
      <InntektOgYtelseOverlappPanelMedData
        inntektPromise={inntektPromise}
        ytelserPromise={ytelserPromise}
      />
    </ResolvingComponent>
  );
}

type InntektOgYtelseOverlappPanelMedDataProps =
  InntektOgYtelseOverlappPanelProps;

/**
 * Viser grafen når dataene er ferdig resolved.
 *
 * @example
 * <InntektOgYtelseOverlappPanelMedData inntektPromise={Promise.resolve(null)} ytelserPromise={Promise.resolve(null)} />
 */
const InntektOgYtelseOverlappPanelMedData = ({
  inntektPromise,
  ytelserPromise,
}: InntektOgYtelseOverlappPanelMedDataProps) => {
  const inntektInformasjon = use(inntektPromise);
  const ytelser = use(ytelserPromise);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [grafVisning, setGrafVisning] = useState<GrafVisning>("linje");

  const månedligData = useMemo(
    () => transformTilMånedligData(inntektInformasjon, ytelser),
    [inntektInformasjon, ytelser],
  );

  const grafData: GrafData | null = useMemo(() => {
    if (månedligData.length === 0) {
      return null;
    }

    const dataMedVerdier = månedligData.filter(
      (d) => d.inntekt !== 0 || d.ytelse !== 0,
    );

    if (dataMedVerdier.length === 0) {
      return null;
    }

    const maksInntekt = Math.max(...månedligData.map((d) => d.inntekt), 0);
    const maksYtelse = Math.max(...månedligData.map((d) => d.ytelse), 0);
    const maksTotal = Math.max(
      ...månedligData.map((d) => d.inntekt + d.ytelse),
      0,
    );
    const maksVerdi = Math.max(maksInntekt, maksYtelse, maksTotal, 1);

    return {
      data: månedligData,
      maksVerdi,
    };
  }, [månedligData]);

  const erTom = !grafData || grafData.data.length === 0;

  return (
    <PanelContainer title="Inntekt og ytelsesutbetalinger over tid" isBeta>
      {erTom ? (
        <Alert variant="info">
          Ingen inntekter eller ytelser funnet for de siste{" "}
          {ANTALL_MÅNEDER_BACK} månedene.
        </Alert>
      ) : (
        <div className="mt-4">
          <div className="flex justify-end absolute top-4 right-4">
            <ToggleGroup
              variant="neutral"
              size="small"
              value={grafVisning}
              aria-label="Velg grafvisning"
              onChange={(value) => setGrafVisning(value as GrafVisning)}
            >
              <ToggleGroupItem value="linje" label="Linjer" />
              <ToggleGroupItem value="stolpe" label="Stolper" />
            </ToggleGroup>
          </div>
          {grafVisning === "linje" ? (
            <Linjegraf
              data={grafData.data}
              maksVerdi={grafData.maksVerdi}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          ) : (
            <Stolpediagram
              data={grafData.data}
              maksVerdi={grafData.maksVerdi}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          )}
          <HoverInfoboks data={grafData.data} hoveredIndex={hoveredIndex} />
          <GrafLegend />
          <SkjultTabell data={grafData.data} />
        </div>
      )}
    </PanelContainer>
  );
};

/**
 * Viser et skjelett mens grafen laster inn data.
 *
 * @example
 * <InntektOgYtelseOverlappPanelSkeleton />
 */
const InntektOgYtelseOverlappPanelSkeleton = () => (
  <PanelContainerSkeleton
    title="Inntekt og ytelser over tid"
    link={{ href: "#", beskrivelse: "Placeholder" }}
  >
    <Skeleton
      variant="rounded"
      width="100%"
      height={`${GRAF_HØYDE}px`}
      className="mb-4"
    />
    <Skeleton variant="rounded" width="100%" height="40px" className="mb-4" />
    <div className="flex justify-center gap-2">
      <Skeleton variant="rounded" width="20px" height="20px" />
      <Skeleton variant="text" width="70px" height="20px" className="mr-4" />
      <Skeleton variant="rounded" width="20px" height="20px" />
      <Skeleton variant="text" width="70px" height="20px" />
    </div>
  </PanelContainerSkeleton>
);

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Skeleton,
  Tooltip,
} from "@navikt/ds-react";
import { use, useEffect, useMemo, useState } from "react";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { useDisclosure } from "~/use-disclosure/useDisclosure";
import { formaterDato, formaterTilIsoDato } from "~/utils/date-utils";
import type { AktivitetType, Dag, MeldekortRespons } from "./domene";

type MeldekortPanelProps = {
  promise: Promise<MeldekortRespons | null | undefined>;
};

/** Viser meldekort for dagpenger */
export function MeldekortPanel({ promise }: MeldekortPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<MeldekortPanelSkeleton />}>
      <MeldekortPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type MeldekortPanelMedDataProps = {
  promise: Promise<MeldekortRespons | null | undefined>;
};

const MeldekortPanelMedData = ({ promise }: MeldekortPanelMedDataProps) => {
  const meldekort = use(promise);

  if (!meldekort || meldekort.length === 0) {
    return null;
  }

  return (
    <PanelContainer title="Meldekort, dagpenger" betaFeature="meldekort">
      <MeldekortVisning meldekort={meldekort} />
    </PanelContainer>
  );
};

const MeldekortPanelSkeleton = () => {
  return (
    <PanelContainerSkeleton title="Meldekort, dagpenger">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" width="220px" height="28px" />
            <Skeleton variant="text" width="280px" height="20px" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-3 mb-2">
              {UKEDAGER.map((dag) => (
                <BodyShort
                  className="font-semibold leading-tight mx-auto"
                  size="large"
                  key={dag}
                  as={Skeleton}
                  variant="text"
                >
                  {dag}
                </BodyShort>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 14 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 list-none"
                >
                  <Skeleton variant="circle" className="w-16 h-16" />
                  <BodyShort
                    className="mx-auto"
                    size="small"
                    as={Skeleton}
                    variant="text"
                  >
                    En dato
                  </BodyShort>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PanelContainerSkeleton>
  );
};

function useSorterteDager(dager: Dag[]): Dag[] {
  return useMemo(
    () => [...dager].sort((a, b) => a.dagIndex - b.dagIndex),
    [dager],
  );
}

function mapAktivitetstype(type: AktivitetType) {
  switch (type) {
    case "Fravaer":
      return "Fravær";
    case "Utdanning":
      return "Kurs";
    default:
      return type;
  }
}

type MeldekortVisningProps = {
  meldekort: MeldekortRespons;
};

const MeldekortVisning = ({ meldekort }: MeldekortVisningProps) => {
  const sorterteMeldekort = useMemo(
    () =>
      [...meldekort].sort((a, b) =>
        b.periode.fraOgMed.localeCompare(a.periode.fraOgMed),
      ),
    [meldekort],
  );
  const [aktivIndex, setAktivIndex] = useState(0);
  useEffect(() => {
    setAktivIndex(0);
  }, [sorterteMeldekort.length]);

  const { erÅpen: erDatepickerÅpen, onToggle: onToggleDatepicker } =
    useDisclosure(false);

  const aktivtMeldekort = sorterteMeldekort[aktivIndex];
  const kanGåTilForrige = aktivIndex < sorterteMeldekort.length - 1;
  const kanGåTilNeste = aktivIndex > 0;

  const velgRelevantMeldekort = (dato: Date | undefined) => {
    if (!dato) {
      return;
    }
    const meldekort = sorterteMeldekort.find((meldekort) => {
      return meldekort.dager.some(
        (dag) => dag.dato === formaterTilIsoDato(dato),
      );
    });
    if (meldekort) {
      setAktivIndex(sorterteMeldekort.indexOf(meldekort));
    }
  };

  const fraDato = new Date(
    sorterteMeldekort[sorterteMeldekort.length - 1].periode.fraOgMed,
  );
  const tilDato = new Date(sorterteMeldekort[0].periode.tilOgMed);
  const tilgjengeligeDager = sorterteMeldekort.flatMap((meldekort) =>
    meldekort.dager.map((dag) => new Date(dag.dato)),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Heading level="3" size="small">
            Periode {formaterDato(aktivtMeldekort.periode.fraOgMed)} –{" "}
            {formaterDato(aktivtMeldekort.periode.tilOgMed)}
          </Heading>
          <BodyShort size="small">
            Meldekort-ID: {aktivtMeldekort.id} – Meldedato:{" "}
            {aktivtMeldekort.meldedato
              ? formaterDato(aktivtMeldekort.meldedato)
              : "Ukjent"}
          </BodyShort>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 absolute top-4 right-4">
          <div className="flex items-center gap-0.5">
            <Button
              icon={
                <Tooltip
                  content={
                    kanGåTilForrige
                      ? "Forrige meldekort"
                      : "Ingen eldre meldekort"
                  }
                >
                  <ChevronLeftIcon aria-hidden="true" />
                </Tooltip>
              }
              type="button"
              variant="secondary-neutral"
              size="small"
              disabled={!kanGåTilForrige}
              aria-label="Forrige meldekort"
              onClick={() => setAktivIndex((index) => index + 1)}
            />
            <DatePicker
              open={erDatepickerÅpen}
              onClose={onToggleDatepicker}
              onSelect={(dato) => {
                velgRelevantMeldekort(dato);
                onToggleDatepicker();
              }}
              dropdownCaption={true}
              fromDate={fraDato}
              toDate={tilDato}
              disabled={[
                { before: fraDato, after: tilDato },
                (date) =>
                  !tilgjengeligeDager.some(
                    (tilgjengeligDag) =>
                      formaterTilIsoDato(tilgjengeligDag) ===
                      formaterTilIsoDato(date),
                  ),
              ]}
            >
              <Button
                aria-label="Velg dato"
                icon={
                  <Tooltip content="Velg dato">
                    <CalendarIcon aria-hidden="true" />
                  </Tooltip>
                }
                type="button"
                variant="secondary-neutral"
                size="small"
                onClick={onToggleDatepicker}
              />
            </DatePicker>
            <Button
              icon={
                <Tooltip
                  content={
                    kanGåTilNeste ? "Neste meldekort" : "Ingen nyere meldekort"
                  }
                >
                  <ChevronRightIcon aria-hidden="true" />
                </Tooltip>
              }
              type="button"
              variant="secondary-neutral"
              size="small"
              disabled={!kanGåTilNeste}
              aria-label="Neste meldekort"
              onClick={() => setAktivIndex((index) => index - 1)}
            />
          </div>
        </div>
      </div>
      <MeldekortDager dager={aktivtMeldekort.dager} />
    </div>
  );
};

const AKTIVITET_FARGER: Record<
  AktivitetType,
  { fill: string; stroke: string }
> = {
  Arbeid: {
    fill: "var(--ax-success-200)",
    stroke: "var(--ax-success-600)",
  },
  Fravaer: {
    fill: "var(--ax-warning-200)",
    stroke: "var(--ax-warning-600)",
  },
  Syk: {
    fill: "var(--ax-danger-200)",
    stroke: "var(--ax-danger-600)",
  },
  Utdanning: {
    fill: "var(--ax-info-200)",
    stroke: "var(--ax-info-600)",
  },
};
const NØYTRAL_FARGE = {
  fill: "var(--ax-neutral-200)",
  stroke: "var(--ax-neutral-600)",
};

const KORT_DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

type MeldekortDagerProps = {
  dager: MeldekortRespons[number]["dager"];
};

const MeldekortDager = ({ dager }: MeldekortDagerProps) => {
  const sorterteDager = useSorterteDager(dager);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-3 mb-2">
          {UKEDAGER.map((dag) => (
            <span
              key={dag}
              className="text-lg font-semibold text-center truncate"
            >
              {dag}
            </span>
          ))}
        </div>
        <ul className="grid grid-cols-7 gap-3" aria-label="Aktiviteter per dag">
          {sorterteDager.map((dag) => {
            const aktivitet = dag.aktiviteter[0];
            const aktivitetType = aktivitet?.type;
            const erArbeid = aktivitetType === "Arbeid";
            const harManglendeTimer = erArbeid && aktivitet?.timer == null;
            const farger = aktivitetType
              ? AKTIVITET_FARGER[aktivitetType]
              : NØYTRAL_FARGE;
            const aktivitetNavn = aktivitetType
              ? mapAktivitetstype(aktivitetType)
              : "Ingen aktivitet";
            const timerTekst = erArbeid
              ? aktivitet?.timer != null
                ? `${aktivitet.timer} t`
                : "Mangler"
              : null;
            const ariaLabel = `${formaterDato(dag.dato)}: ${aktivitetNavn}${
              timerTekst ? ` ${timerTekst}` : ""
            }${harManglendeTimer ? " (manglende timer)" : ""}`;

            return (
              <li
                key={dag.dagIndex}
                className="flex flex-col items-center gap-2 list-none"
              >
                <div
                  className="relative flex flex-col items-center justify-center rounded-full border-2 text-center px-2 w-16 h-16"
                  style={{
                    backgroundColor: farger.fill,
                    borderColor: farger.stroke,
                  }}
                  aria-label={ariaLabel}
                >
                  <span className="text-sm font-semibold leading-tight">
                    {aktivitetType ? aktivitetNavn : "–"}
                  </span>
                  {erArbeid && (
                    <span className="text-sm leading-tight">{timerTekst}</span>
                  )}
                </div>
                <span className="text-sm text-ax-text-subtle">
                  {formaterKortDato(dag.dato)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const UKEDAGER = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

function formaterKortDato(isoDato: string) {
  try {
    return KORT_DATO_FORMAT.format(new Date(isoDato));
  } catch {
    return isoDato;
  }
}

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Skeleton,
  Tooltip,
} from "@navikt/ds-react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@navikt/ds-react/Accordion";
import { useEffect, useMemo, useState } from "react";
import { StatistikkKort } from "~/paneler/StatistikkKort";
import { useDisclosure } from "~/use-disclosure/useDisclosure";
import { formaterDato, formaterTilIsoDato } from "~/utils/date-utils";
import type { AktivitetType, Dag, MeldekortRespons } from "./domene";
import { useMeldekort } from "./MeldekortContext";
import { beregnAktivitetStatistikk } from "./utils";

type MeldekortPanelProps = {
  fraDato: string;
  tilDato: string;
};

/** Viser meldekort for dagpenger */
export function MeldekortPanel({ fraDato, tilDato }: MeldekortPanelProps) {
  const meldekortState = useMeldekort();

  if (!meldekortState || meldekortState.status === "loading") {
    return <MeldekortPanelSkeleton />;
  }

  if (meldekortState.status === "error") {
    return (
      <Alert variant="error" size="small">
        Kunne ikke hente meldekort: {meldekortState.error}
      </Alert>
    );
  }

  const { meldekort } = meldekortState;

  if (!meldekort || meldekort.length === 0) {
    return (
      <Alert variant="info" size="small">
        Ingen meldekort registrert.
      </Alert>
    );
  }

  return (
    <MeldekortVisning
      meldekort={meldekort}
      fraDato={fraDato}
      tilDato={tilDato}
    />
  );
}

const MeldekortPanelSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton variant="text" width="220px" height="28px" />
      <div>
        <Skeleton variant="text" width="120px" height="20px" className="mb-2" />
        <div className="grid grid-cols-2 ax-md:grid-cols-4 gap-4">
          <StatistikkKort label="Jobb" verdi="" isLoading />
          <StatistikkKort label="Ferie" verdi="" isLoading />
          <StatistikkKort label="Kurs" verdi="" isLoading />
          <StatistikkKort label="Sykdom" verdi="" isLoading />
        </div>
      </div>
      <Skeleton variant="rounded" width="100%" height="48px" />
    </div>
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
  fraDato: string;
  tilDato: string;
};

const MeldekortVisning = ({
  meldekort,
  fraDato,
  tilDato,
}: MeldekortVisningProps) => {
  const sorterteMeldekort = useMemo(() => {
    const periodeFra = new Date(fraDato);
    const periodeTil = new Date(tilDato);
    return [...(meldekort ?? [])]
      .filter(
        (m) =>
          new Date(m.periode.tilOgMed) >= periodeFra &&
          new Date(m.periode.fraOgMed) <= periodeTil,
      )
      .sort((a, b) => b.periode.fraOgMed.localeCompare(a.periode.fraOgMed));
  }, [meldekort, fraDato, tilDato]);
  const [aktivIndex, setAktivIndex] = useState(0);
  useEffect(() => {
    setAktivIndex(0);
  }, [sorterteMeldekort.length]);

  const { erÅpen: erDatepickerÅpen, onToggle: onToggleDatepicker } =
    useDisclosure(false);

  const aktivtMeldekort = sorterteMeldekort[aktivIndex] ?? null;

  const aktivtMeldekortStatistikk = useMemo(
    () =>
      aktivtMeldekort ? beregnAktivitetStatistikk(aktivtMeldekort.dager) : null,
    [aktivtMeldekort],
  );

  const totalStatistikk = useMemo(() => {
    const alleDager = sorterteMeldekort.flatMap((m) => m.dager);
    return beregnAktivitetStatistikk(alleDager);
  }, [sorterteMeldekort]);

  if (sorterteMeldekort.length === 0 || !aktivtMeldekort) {
    return (
      <Alert variant="info" size="small">
        Ingen meldekort i denne perioden.
      </Alert>
    );
  }

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

  const datepickerFraDato = new Date(
    sorterteMeldekort[sorterteMeldekort.length - 1].periode.fraOgMed,
  );
  const datepickerTilDato = new Date(sorterteMeldekort[0].periode.tilOgMed);
  const tilgjengeligeDager = sorterteMeldekort.flatMap((meldekort) =>
    meldekort.dager.map((dag) => new Date(dag.dato)),
  );

  return (
    <div className="flex flex-col gap-3">
      <Heading level="2" size="medium">
        Meldekort
      </Heading>
      <div>
        <Heading level="3" size="xsmall" className="mb-2">
          Totalt fra {formaterDato(fraDato)} til {formaterDato(tilDato)}
        </Heading>
        <div className="grid grid-cols-2 ax-md:grid-cols-4 gap-4">
          <StatistikkKort
            label="Jobb"
            verdi={`${totalStatistikk.arbeidTimer} t`}
          />
          <StatistikkKort
            label="Ferie"
            verdi={`${totalStatistikk.ferieDager} ${totalStatistikk.ferieDager === 1 ? "dag" : "dager"}`}
          />
          <StatistikkKort
            label="Kurs"
            verdi={`${totalStatistikk.kursDager} ${totalStatistikk.kursDager === 1 ? "dag" : "dager"}`}
          />
          <StatistikkKort
            label="Sykdom"
            verdi={`${totalStatistikk.sykdomDager} ${totalStatistikk.sykdomDager === 1 ? "dag" : "dager"}`}
          />
        </div>
      </div>
      <Accordion>
        <AccordionItem>
          <AccordionHeader>Vis individuelle meldekort</AccordionHeader>
          <AccordionContent>
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
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="flex items-center gap-0.5">
                    <Button
                      data-color="neutral"
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
                      variant="secondary"
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
                      fromDate={datepickerFraDato}
                      toDate={datepickerTilDato}
                      disabled={[
                        { before: datepickerFraDato, after: datepickerTilDato },
                        (date) =>
                          !tilgjengeligeDager.some(
                            (tilgjengeligDag) =>
                              formaterTilIsoDato(tilgjengeligDag) ===
                              formaterTilIsoDato(date),
                          ),
                      ]}
                    >
                      <Button
                        data-color="neutral"
                        aria-label="Velg dato"
                        icon={
                          <Tooltip content="Velg dato">
                            <CalendarIcon aria-hidden="true" />
                          </Tooltip>
                        }
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={onToggleDatepicker}
                      />
                    </DatePicker>
                    <Button
                      data-color="neutral"
                      icon={
                        <Tooltip
                          content={
                            kanGåTilNeste
                              ? "Neste meldekort"
                              : "Ingen nyere meldekort"
                          }
                        >
                          <ChevronRightIcon aria-hidden="true" />
                        </Tooltip>
                      }
                      type="button"
                      variant="secondary"
                      size="small"
                      disabled={!kanGåTilNeste}
                      aria-label="Neste meldekort"
                      onClick={() => setAktivIndex((index) => index - 1)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Heading level="3" size="xsmall" className="mb-2">
                  Dette meldekortet
                </Heading>
                <div className="grid grid-cols-2 ax-md:grid-cols-4 gap-4">
                  <StatistikkKort
                    label="Jobb"
                    verdi={`${aktivtMeldekortStatistikk?.arbeidTimer ?? 0} t`}
                  />
                  <StatistikkKort
                    label="Ferie"
                    verdi={`${aktivtMeldekortStatistikk?.ferieDager ?? 0} ${aktivtMeldekortStatistikk?.ferieDager === 1 ? "dag" : "dager"}`}
                  />
                  <StatistikkKort
                    label="Kurs"
                    verdi={`${aktivtMeldekortStatistikk?.kursDager ?? 0} ${aktivtMeldekortStatistikk?.kursDager === 1 ? "dag" : "dager"}`}
                  />
                  <StatistikkKort
                    label="Sykdom"
                    verdi={`${aktivtMeldekortStatistikk?.sykdomDager ?? 0} ${aktivtMeldekortStatistikk?.sykdomDager === 1 ? "dag" : "dager"}`}
                  />
                </div>
              </div>
              <MeldekortDager dager={aktivtMeldekort.dager} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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

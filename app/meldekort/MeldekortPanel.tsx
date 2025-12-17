import { ChevronLeftIcon, ChevronRightIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  Heading,
  Skeleton,
  Table,
} from "@navikt/ds-react";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { use, useEffect, useMemo, useState } from "react";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { formaterDato } from "~/utils/date-utils";
import type { MeldekortRespons } from "./domene";

type MeldekortPanelProps = {
  promise: Promise<MeldekortRespons | null | undefined>;
};

/** Placeholder-panel for meldekort */
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

  return (
    <PanelContainer title="Meldekort, dagpenger">
      {!meldekort ? (
        <Alert variant="warning" className="w-fit">
          Fant ikke meldekort
        </Alert>
      ) : meldekort.length === 0 ? (
        <Alert variant="info" className="w-fit">
          Ingen meldekort registrert
        </Alert>
      ) : (
        <MeldekortTabell meldekort={meldekort} />
      )}
    </PanelContainer>
  );
};

const MeldekortPanelSkeleton = () => {
  return (
    <PanelContainerSkeleton title="Meldekort">
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" width="45%" />
      </div>
    </PanelContainerSkeleton>
  );
};

const AKTIVITET_TYPER = ["Arbeid", "Fravaer", "Syk", "Utdanning"] as const;
type AktivitetType = (typeof AKTIVITET_TYPER)[number];

const TIMER_FORMAT = new Intl.NumberFormat("nb-NO", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function sorterDager(
  dager: MeldekortRespons[number]["dager"],
): MeldekortRespons[number]["dager"] {
  return [...dager].sort((a, b) => a.dagIndex - b.dagIndex);
}

function formaterAktiviteter(
  aktiviteter: MeldekortRespons[number]["dager"][number]["aktiviteter"],
) {
  if (aktiviteter.length === 0) {
    return "–";
  }

  const oppsummering = AKTIVITET_TYPER.map((type) => {
    const aktiviteterForType = aktiviteter.filter(
      (aktivitet) => aktivitet.type === type,
    );

    if (aktiviteterForType.length === 0) {
      return null;
    }

    const navn = mapAktivitetstype(type);
    const manglerTimer = aktiviteterForType.some(
      (aktivitet) => aktivitet.timer == null,
    );

    if (manglerTimer) {
      return navn;
    }

    const sum = aktiviteterForType.reduce(
      (total, aktivitet) => total + (aktivitet.timer ?? 0),
      0,
    );

    return `${navn} ${TIMER_FORMAT.format(sum)} t`;
  }).filter(Boolean);

  if (oppsummering.length === 0) {
    return "–";
  }

  return oppsummering.join(", ");
}

function mapAktivitetstype(type: AktivitetType) {
  switch (type) {
    case "Fravaer":
      return "Fravær";
    default:
      return type;
  }
}

type MeldekortTabellProps = {
  meldekort: MeldekortRespons;
};

const MeldekortTabell = ({ meldekort }: MeldekortTabellProps) => {
  const sorterteMeldekort = useMemo(
    () =>
      [...meldekort].sort((a, b) =>
        b.periode.fraOgMed.localeCompare(a.periode.fraOgMed),
      ),
    [meldekort],
  );
  const [aktivtIndex, setAktivtIndex] = useState(0);

  useEffect(() => {
    setAktivtIndex(0);
  }, [sorterteMeldekort.length]);

  const aktivtMeldekort = sorterteMeldekort[aktivtIndex];
  const kanGåTilForrige = aktivtIndex < sorterteMeldekort.length - 1;
  const kanGåTilNeste = aktivtIndex > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Heading level="3" size="small">
            Periode {formaterDato(aktivtMeldekort.periode.fraOgMed)} –{" "}
            {formaterDato(aktivtMeldekort.periode.tilOgMed)}
          </Heading>
          <BodyShort size="small">Meldekort-ID: {aktivtMeldekort.id}</BodyShort>
          {aktivtMeldekort.meldedato && (
            <BodyShort size="small">
              Meldedato: {formaterDato(aktivtMeldekort.meldedato)}
            </BodyShort>
          )}
          {sorterteMeldekort.length > 1 && (
            <BodyShort size="small">
              Viser {aktivtIndex + 1} av {sorterteMeldekort.length}
            </BodyShort>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            icon={<ChevronLeftIcon title="Forrige meldekort" />}
            variant="secondary-neutral"
            size="small"
            disabled={!kanGåTilForrige}
            onClick={() => setAktivtIndex((index) => index + 1)}
          />
          <Button
            icon={<ChevronRightIcon title="Neste meldekort" />}
            variant="secondary-neutral"
            size="small"
            disabled={!kanGåTilNeste}
            onClick={() => setAktivtIndex((index) => index - 1)}
          />
        </div>
      </div>
      <Table size="small" zebraStripes>
        <TableHeader>
          <TableRow>
            <TableHeaderCell scope="col" textSize="small">
              Dato
            </TableHeaderCell>
            <TableHeaderCell scope="col" textSize="small">
              Aktivitet
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorterDager(aktivtMeldekort.dager).map((dag) => (
            <TableRow key={`${aktivtMeldekort.id}-${dag.dagIndex}`}>
              <TableHeaderCell scope="row" textSize="small">
                {formaterDato(dag.dato)}
              </TableHeaderCell>
              <TableDataCell textSize="small">
                {formaterAktiviteter(dag.aktiviteter)}
              </TableDataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

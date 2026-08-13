import { Alert, Heading, Skeleton } from "@navikt/ds-react";
import { useMemo } from "react";

import { StatistikkKort } from "~/paneler/StatistikkKort";
import { formaterDato } from "~/utils/date-utils";

import { useMeldekort } from "./MeldekortContext";
import { beregnAktivitetStatistikk } from "./utils";

type MeldekortPanelProps = {
  fraDato: string;
  tilDato: string;
};

/**
 * Viser totalstatistikk (Jobb/Ferie/Kurs/Sykdom) for meldekort i valgt periode.
 * Se `IndividuelleMeldekortAccordion` for detaljvisning per meldekort.
 */
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
    <MeldekortTotalStatistikk
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
    </div>
  );
};

type MeldekortTotalStatistikkProps = {
  meldekort: import("./domene").MeldekortRespons;
  fraDato: string;
  tilDato: string;
};

const MeldekortTotalStatistikk = ({
  meldekort,
  fraDato,
  tilDato,
}: MeldekortTotalStatistikkProps) => {
  const sorterteMeldekort = useMemo(() => {
    const periodeFra = new Date(fraDato);
    const periodeTil = new Date(tilDato);
    return (meldekort ?? []).filter(
      (m) =>
        new Date(m.periode.tilOgMed) >= periodeFra &&
        new Date(m.periode.fraOgMed) <= periodeTil,
    );
  }, [meldekort, fraDato, tilDato]);

  const totalStatistikk = useMemo(() => {
    const alleDager = sorterteMeldekort.flatMap((m) => m.dager);
    return beregnAktivitetStatistikk(alleDager);
  }, [sorterteMeldekort]);

  if (sorterteMeldekort.length === 0) {
    return (
      <Alert variant="info" size="small">
        Ingen meldekort i denne perioden.
      </Alert>
    );
  }

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
    </div>
  );
};

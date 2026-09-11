import { Alert, Heading, Skeleton } from "@navikt/ds-react";
import { useMemo } from "react";

import { StatistikkKort } from "~/paneler/StatistikkKort";
import { formaterDato } from "~/utils/date-utils";
import { formaterDesimaltall, formaterProsent } from "~/utils/number-utils";

import { useAapMeldekort } from "./AapMeldekortContext";
import type { AapMeldekortRespons } from "./domene";
import {
  beregnProrertArbeidetTimer,
  flatterOgFiltrerAapPerioder,
} from "./utils";

type AapMeldekortPanelProps = {
  fraDato: string;
  tilDato: string;
};

/**
 * Viser totalstatistikk (arbeidet timer, snitt utbetalingsgrad, antall
 * perioder) for AAP-meldekortperioder i valgt periode.
 * Se `IndividuelleAapMeldekortAccordion` for detaljvisning per periode.
 */
export function AapMeldekortPanel({
  fraDato,
  tilDato,
}: AapMeldekortPanelProps) {
  const aapState = useAapMeldekort();

  if (!aapState || aapState.status === "loading") {
    return <AapMeldekortPanelSkeleton />;
  }

  if (aapState.status === "error") {
    return (
      <Alert variant="error" size="small">
        Kunne ikke hente AAP-meldekort: {aapState.error}
      </Alert>
    );
  }

  if (!aapState.vedtak || aapState.vedtak.length === 0) {
    return (
      <Alert variant="info" size="small">
        Ingen AAP-meldekort registrert.
      </Alert>
    );
  }

  return (
    <AapMeldekortTotalStatistikk
      vedtak={aapState.vedtak}
      fraDato={fraDato}
      tilDato={tilDato}
    />
  );
}

const AapMeldekortPanelSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton variant="text" width="220px" height="28px" />
      <div>
        <Skeleton variant="text" width="120px" height="20px" className="mb-2" />
        <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
          <StatistikkKort label="Arbeidet timer totalt" verdi="" isLoading />
          <StatistikkKort label="Snitt utbetalingsgrad" verdi="" isLoading />
          <StatistikkKort label="Antall perioder" verdi="" isLoading />
        </div>
      </div>
    </div>
  );
};

type AapMeldekortTotalStatistikkProps = {
  vedtak: AapMeldekortRespons;
  fraDato: string;
  tilDato: string;
};

const AapMeldekortTotalStatistikk = ({
  vedtak,
  fraDato,
  tilDato,
}: AapMeldekortTotalStatistikkProps) => {
  const perioder = useMemo(
    () => flatterOgFiltrerAapPerioder(vedtak, fraDato, tilDato),
    [vedtak, fraDato, tilDato],
  );

  // Perioder som bare DELVIS overlapper valgt vindu skal ikke bidra med sin
  // fulle arbeidetTimer til "Totalt fra {fraDato} til {tilDato}" — prorer
  // per periode etter andel dager som faktisk faller innenfor vinduet
  // (samme prinsipp som beregnAapTimerForMåned i ~/meldekort/utils.ts).
  const totalArbeidetTimer = useMemo(
    () =>
      perioder.reduce(
        (sum, p) => sum + beregnProrertArbeidetTimer(p, fraDato, tilDato),
        0,
      ),
    [perioder, fraDato, tilDato],
  );

  // Skiller "ingen periode har arbeidetTimer-data" (vis "–") fra "summen er
  // reelt 0" (vis "0 t") — null skal IKKE stille konverteres til en
  // tilsynelatende pålitelig 0-verdi, samme prinsipp som brukt for
  // annenReduksjon/utbetalingsgrad og i IndividuelleAapMeldekortAccordion.
  const harArbeidetTimerData = useMemo(
    () => perioder.some((p) => p.arbeidetTimer != null),
    [perioder],
  );

  const snittUtbetalingsgrad = useMemo(() => {
    const verdier = perioder
      .map((p) => p.utbetalingsgrad)
      .filter((v): v is number => v != null);
    if (verdier.length === 0) {
      return null;
    }
    return verdier.reduce((sum, v) => sum + v, 0) / verdier.length;
  }, [perioder]);

  if (perioder.length === 0) {
    return (
      <Alert variant="info" size="small">
        Ingen AAP-meldekort i denne perioden.
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Heading level="2" size="medium">
        AAP-meldekort
      </Heading>
      <div>
        <Heading level="3" size="xsmall" className="mb-2">
          Totalt fra {formaterDato(fraDato)} til {formaterDato(tilDato)}
        </Heading>
        <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
          <StatistikkKort
            label="Arbeidet timer totalt"
            verdi={
              harArbeidetTimerData
                ? `${formaterDesimaltall(totalArbeidetTimer, 0, 1)} t`
                : "–"
            }
          />
          <StatistikkKort
            label="Snitt utbetalingsgrad"
            verdi={
              snittUtbetalingsgrad != null
                ? formaterProsent(snittUtbetalingsgrad)
                : "–"
            }
          />
          <StatistikkKort
            label="Antall perioder"
            verdi={`${perioder.length}`}
          />
        </div>
      </div>
    </div>
  );
};

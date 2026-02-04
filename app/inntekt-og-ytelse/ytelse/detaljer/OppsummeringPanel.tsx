import { useMemo } from "react";
import { useMeldekort } from "~/meldekort/MeldekortContext";
import { StatistikkKort } from "~/paneler/StatistikkKort";
import { useTidsvindu } from "~/tidsvindu/Tidsvindu";
import { formaterDato } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";
import { beregnYtelseStatistikk, formaterPeriode } from "../utils";

type OppsummeringPanelProps = {
  perioder: Ytelse["perioder"];
};

export function OppsummeringPanel({ perioder }: OppsummeringPanelProps) {
  const statistikk = beregnYtelseStatistikk(perioder);
  const meldekortState = useMeldekort();
  const { tidsvinduIAntallMåneder } = useTidsvindu();

  const meldekortStatistikk = useMemo(() => {
    if (!meldekortState || meldekortState.status !== "success") {
      return null;
    }

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - tidsvinduIAntallMåneder);

    const filtrerteMeldekort = meldekortState.meldekort.filter(
      (m) => new Date(m.periode.tilOgMed) >= cutoff,
    );

    const totalArbeidstimer = filtrerteMeldekort
      .flatMap((m) => m.dager)
      .flatMap((d) => d.aktiviteter)
      .filter((a) => a.type === "Arbeid")
      .reduce((sum, a) => sum + (a.timer ?? 0), 0);

    return {
      antallMeldekort: filtrerteMeldekort.length,
      totalArbeidstimer,
    };
  }, [meldekortState, tidsvinduIAntallMåneder]);

  const størsteUtbetalingBeskrivelse = statistikk.størsteUtbetalingPeriode
    ? formaterPeriode(statistikk.størsteUtbetalingPeriode.periode, formaterDato)
    : undefined;

  return (
    <div className="grid grid-cols-2 ax-md:grid-cols-3 gap-4">
      <StatistikkKort
        label="Utbetalinger"
        verdi={String(statistikk.antallUtbetalinger)}
      />
      {statistikk.antallTilbakekrevinger > 0 && (
        <StatistikkKort
          label="Tilbakekrevinger"
          verdi={String(statistikk.antallTilbakekrevinger)}
        />
      )}
      <StatistikkKort
        label="Unike perioder"
        verdi={String(statistikk.antallPerioder)}
      />
      <StatistikkKort
        label="Totalt utbetalt (brutto)"
        verdi={formaterBeløp(statistikk.totalBrutto, 0)}
      />
      <StatistikkKort
        label="Totalt utbetalt (netto)"
        verdi={formaterBeløp(statistikk.totalNetto, 0)}
      />
      <StatistikkKort
        label="Største utbetaling"
        verdi={formaterBeløp(
          statistikk.størsteUtbetalingPeriode?.bruttoBeløp ?? 0,
          0,
        )}
        beskrivelse={størsteUtbetalingBeskrivelse}
      />
      <StatistikkKort
        label="Snitt per utbetaling"
        verdi={formaterBeløp(statistikk.gjennomsnittligUtbetaling, 0)}
      />
      {meldekortState?.status === "loading" && (
        <>
          <StatistikkKort label="Meldekort" verdi="" isLoading />
          <StatistikkKort label="Timer ført på arbeid" verdi="" isLoading />
        </>
      )}
      {meldekortStatistikk && (
        <>
          <StatistikkKort
            label="Antall meldekort"
            verdi={String(meldekortStatistikk.antallMeldekort)}
          />
          <StatistikkKort
            label="Timer ført på arbeid"
            verdi={`${meldekortStatistikk.totalArbeidstimer} t`}
            beskrivelse="via meldekort"
          />
        </>
      )}
    </div>
  );
}

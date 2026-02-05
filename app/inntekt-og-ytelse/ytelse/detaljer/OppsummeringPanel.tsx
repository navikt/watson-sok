import { useMemo } from "react";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { useMeldekort } from "~/meldekort/MeldekortContext";
import { StatistikkKort } from "~/paneler/StatistikkKort";
import { useTidsvindu } from "~/tidsvindu/Tidsvindu";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";
import { beregnYtelseStatistikk } from "../utils";

type OppsummeringPanelProps = {
  perioder: Ytelse["perioder"];
};

export function OppsummeringPanel({ perioder }: OppsummeringPanelProps) {
  const statistikk = beregnYtelseStatistikk(perioder);
  const meldekortState = useMeldekort();
  const { tidsvinduIAntallMåneder } = useTidsvindu();
  const visMeldekort = useEnkeltFeatureFlagg(FeatureFlagg.VIS_MELDEKORT_PANEL);

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
      totalArbeidstimer,
    };
  }, [meldekortState, tidsvinduIAntallMåneder]);

  const meldekortLaster = meldekortState?.status === "loading";

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
        beskrivelse={`${formaterBeløp(statistikk.totalNetto, 0)} (netto)`}
      />
      {visMeldekort && meldekortState && (
        <StatistikkKort
          label="Timer ført på arbeid"
          verdi={`${meldekortStatistikk?.totalArbeidstimer ?? 0} t`}
          isLoading={meldekortLaster}
        />
      )}
    </div>
  );
}

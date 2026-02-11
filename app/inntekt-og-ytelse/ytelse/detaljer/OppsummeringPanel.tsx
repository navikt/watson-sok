import { useMemo } from "react";
import { FeatureFlagg } from "~/feature-toggling/featureflagg";
import { useEnkeltFeatureFlagg } from "~/feature-toggling/useFeatureFlagg";
import { useMeldekort } from "~/meldekort/MeldekortContext";
import { StatistikkKort } from "~/paneler/StatistikkKort";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";
import { beregnYtelseStatistikk } from "../utils";

type OppsummeringPanelProps = {
  perioder: Ytelse["perioder"];
  fraDato: string;
  tilDato: string;
};

export function OppsummeringPanel({
  perioder,
  fraDato,
  tilDato,
}: OppsummeringPanelProps) {
  const statistikk = beregnYtelseStatistikk(perioder);
  const meldekortState = useMeldekort();
  const visMeldekort = useEnkeltFeatureFlagg(FeatureFlagg.VIS_MELDEKORT_PANEL);

  const meldekortStatistikk = useMemo(() => {
    if (!visMeldekort || !meldekortState || meldekortState.status !== "success") {
      return null;
    }

    const fra = new Date(fraDato);
    const til = new Date(tilDato);

    const filtrerteMeldekort = meldekortState.meldekort.filter(
      (m) =>
        new Date(m.periode.tilOgMed) >= fra &&
        new Date(m.periode.fraOgMed) <= til,
    );

    const totalArbeidstimer = filtrerteMeldekort
      .flatMap((m) => m.dager)
      .flatMap((d) => d.aktiviteter)
      .filter((a) => a.type === "Arbeid")
      .reduce((sum, a) => sum + (a.timer ?? 0), 0);

    return {
      totalArbeidstimer,
    };
  }, [meldekortState, fraDato, tilDato, visMeldekort]);

  const meldekortLaster = meldekortState?.status === "loading";

  return (
    <div className="grid grid-cols-2 ax-md:grid-cols-3 gap-4">
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

import { StatistikkKort } from "~/paneler/StatistikkKort";
import { formaterDato } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";
import { beregnYtelseStatistikk, formaterPeriode } from "../utils";

type OppsummeringPanelProps = {
  perioder: Ytelse["perioder"];
};

export function OppsummeringPanel({ perioder }: OppsummeringPanelProps) {
  const statistikk = beregnYtelseStatistikk(perioder);

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
    </div>
  );
}

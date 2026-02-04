import { useMemo } from "react";
import { StatistikkKort } from "~/paneler/StatistikkKort";
import { formaterDato } from "~/utils/date-utils";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";
import { grupperSammenhengendePerioder } from "../utils";

type OppsummeringPanelProps = {
  ytelse: Ytelse;
};

export function OppsummeringPanel({ ytelse }: OppsummeringPanelProps) {
  const statistikk = useMemo(() => {
    const utbetalinger = ytelse.perioder.filter((p) => p.beløp >= 0);
    const tilbakekrevinger = ytelse.perioder.filter((p) => p.beløp < 0);
    const gruppertePerioder = grupperSammenhengendePerioder(ytelse.perioder);

    const totalBrutto = ytelse.perioder.reduce(
      (sum, p) => sum + (p.bruttoBeløp ?? 0),
      0,
    );
    const totalNetto = ytelse.perioder.reduce((sum, p) => sum + p.beløp, 0);

    const størsteUtbetalingPeriode = utbetalinger.reduce<
      (typeof utbetalinger)[number] | null
    >(
      (max, p) =>
        !max || (p.bruttoBeløp ?? 0) > (max.bruttoBeløp ?? 0) ? p : max,
      null,
    );

    const gjennomsnittligUtbetaling =
      utbetalinger.length > 0
        ? utbetalinger.reduce((sum, p) => sum + (p.bruttoBeløp ?? 0), 0) /
          utbetalinger.length
        : 0;

    return {
      antallUtbetalinger: utbetalinger.length,
      antallTilbakekrevinger: tilbakekrevinger.length,
      antallPerioder: gruppertePerioder.length,
      totalBrutto,
      totalNetto,
      størsteUtbetalingPeriode,
      gjennomsnittligUtbetaling,
    };
  }, [ytelse.perioder]);

  const størsteUtbetalingBeskrivelse = statistikk.størsteUtbetalingPeriode
    ? formaterPeriode(statistikk.størsteUtbetalingPeriode.periode)
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

function formaterPeriode(periode: { fom: string; tom: string }): string {
  const fom = formaterDato(periode.fom);
  const tom = formaterDato(periode.tom);
  return fom === tom ? fom : `${fom} – ${tom}`;
}

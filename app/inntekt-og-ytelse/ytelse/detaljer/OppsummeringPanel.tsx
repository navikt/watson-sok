import { useMemo } from "react";
import { StatistikkKort } from "~/paneler/StatistikkKort";
import { formaterBeløp } from "~/utils/number-utils";
import type { Ytelse } from "../domene";
import { grupperSammenhengendePerioder } from "../utils";

type OppsummeringPanelProps = {
  ytelse: Ytelse;
};

export function OppsummeringPanel({ ytelse }: OppsummeringPanelProps) {
  const { antallUtbetalinger, antallTilbakekrevinger, antallPerioder } =
    useMemo(() => {
      const utbetalinger = ytelse.perioder.filter((p) => p.beløp >= 0);
      const tilbakekrevinger = ytelse.perioder.filter((p) => p.beløp < 0);
      const gruppertePerioder = grupperSammenhengendePerioder(ytelse.perioder);

      return {
        antallUtbetalinger: utbetalinger.length,
        antallTilbakekrevinger: tilbakekrevinger.length,
        antallPerioder: gruppertePerioder.length,
      };
    }, [ytelse.perioder]);

  const totalBrutto = ytelse.perioder.reduce(
    (sum, p) => sum + (p.bruttoBeløp ?? 0),
    0,
  );
  const totalNetto = ytelse.perioder.reduce((sum, p) => sum + p.beløp, 0);

  return (
    <div className="grid grid-cols-2 ax-md:grid-cols-3 gap-4">
      <StatistikkKort label="Utbetalinger" verdi={String(antallUtbetalinger)} />
      {antallTilbakekrevinger > 0 && (
        <StatistikkKort
          label="Tilbakekrevinger"
          verdi={String(antallTilbakekrevinger)}
        />
      )}
      <StatistikkKort label="Unike perioder" verdi={String(antallPerioder)} />
      <StatistikkKort
        label="Totalt utbetalt (brutto)"
        verdi={formaterBeløp(totalBrutto, 0)}
      />
      <StatistikkKort
        label="Totalt utbetalt (netto)"
        verdi={formaterBeløp(totalNetto, 0)}
      />
    </div>
  );
}

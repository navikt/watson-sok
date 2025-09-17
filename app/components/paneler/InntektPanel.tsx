import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Alert, Table } from "@navikt/ds-react";
import { isValid as isValidDate, parse } from "date-fns";
import type { CSSProperties } from "react";
import type { InntektInformasjon } from "~/routes/oppslag/[ident]/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import {
  formatterBeløp,
  formatterDesimaltall,
  konverterTilTall,
} from "~/utils/number-utils";
import { camelCaseTilNorsk, storFørsteBokstav } from "~/utils/string-utils";
import { PanelContainer } from "./PanelContainer";

// Highlight-stil for celler i rad med flere versjoner
const warnStyle: CSSProperties = {
  backgroundColor: "var(--a-surface-warning-subtle)",
  boxShadow: "inset 0 0 0 1px var(--a-border-warning-subtle)",
};

type InntektPanelProps = { inntektInformasjon: InntektInformasjon };
export function InntektPanel({ inntektInformasjon }: InntektPanelProps) {
  const alle = inntektInformasjon.lønnsinntekt ?? [];

  // Siste 3 år (36 mnd)
  const nå = new Date();
  const cutoff = new Date(nå.getFullYear(), nå.getMonth() - 36, 1);

  const rader = alle
    .filter((r) => {
      const dato = parse(r.periode ?? "", "yyyy-MM", new Date());
      return isValidDate(dato) && dato >= cutoff;
    })
    .sort((a, b) =>
      (a.periode ?? "").localeCompare(b.periode ?? "", "nb", { numeric: true }),
    )
    .reverse();

  const erTom = rader.length === 0;

  return (
    <PanelContainer title="Inntekt">
      {erTom ? (
        <Alert variant="info">
          Ingen lønnsutbetalinger funnet for de siste 3 årene.
        </Alert>
      ) : (
        <div className="mt-4 max-h-[500px] overflow-y-scroll">
          <Alert variant="warning" className="mb-2">
            Rader markert i gult og med varselikon har flere versjoner i
            A-ordningen.
          </Alert>
          <Table size="medium">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col" textSize="small">
                  Periode
                </Table.HeaderCell>
                <Table.HeaderCell scope="col" textSize="small">
                  Arbeidsgiver
                </Table.HeaderCell>
                <Table.HeaderCell scope="col" textSize="small">
                  Lønnstype
                </Table.HeaderCell>
                <Table.HeaderCell scope="col" textSize="small">
                  Timer
                </Table.HeaderCell>
                <Table.HeaderCell scope="col" align="right" textSize="small">
                  Beløp
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {rader.map((r, i) => {
                const timer = konverterTilTall(r.antall);
                const beløp = konverterTilTall(r.beløp);
                const harFlereVersjoner = Boolean(r.harFlereVersjoner);
                const cellStyle = harFlereVersjoner ? warnStyle : undefined;

                return (
                  <Table.Row
                    key={`${r.arbeidsgiver}-${r.periode}-${i}`}
                    aria-label={
                      harFlereVersjoner ? "Har flere versjoner" : undefined
                    }
                  >
                    <Table.HeaderCell
                      scope="row"
                      style={cellStyle}
                      textSize="small"
                    >
                      <span className="inline-flex items-center gap-2">
                        {harFlereVersjoner && (
                          <ExclamationmarkTriangleFillIcon
                            aria-label="Flere versjoner"
                            title="Flere versjoner"
                            style={{ color: "var(--a-icon-warning)" }}
                            fontSize="1.125rem"
                          />
                        )}
                        <span>
                          {storFørsteBokstav(formatÅrMåned(r.periode))}
                        </span>
                        {harFlereVersjoner && (
                          <span className="sr-only"> (flere versjoner)</span>
                        )}
                      </span>
                    </Table.HeaderCell>
                    <Table.DataCell style={cellStyle} textSize="small">
                      {r.arbeidsgiver || "–"}
                    </Table.DataCell>
                    <Table.DataCell style={cellStyle} textSize="small">
                      {camelCaseTilNorsk(r.lønnstype)}
                    </Table.DataCell>
                    <Table.DataCell style={cellStyle} textSize="small">
                      {timer !== null ? formatterDesimaltall(timer, 0, 2) : "–"}
                    </Table.DataCell>
                    <Table.DataCell
                      style={{ ...cellStyle, textAlign: "right" }}
                      textSize="small"
                    >
                      {beløp !== null ? formatterBeløp(beløp) : "–"}
                    </Table.DataCell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </PanelContainer>
  );
}

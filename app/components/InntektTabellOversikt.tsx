import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Alert, Box, ExpansionCard, Table } from "@navikt/ds-react";
import { format, isValid as isValidDate, parse } from "date-fns";
import { nb } from "date-fns/locale";
import type { CSSProperties } from "react";
import type { InntektInformasjon } from "~/routes/oppslag/[ident]/schemas";

// Highlight-stil for celler i rad med flere versjoner
const warnStyle: CSSProperties = {
  backgroundColor: "var(--a-surface-warning-subtle)",
  boxShadow: "inset 0 0 0 1px var(--a-border-warning-subtle)",
};

type InntektTabellOversiktProps = { inntektInformasjon: InntektInformasjon };
export default function InntektTabellOversikt({
  inntektInformasjon,
}: InntektTabellOversiktProps) {
  const alle = inntektInformasjon?.loennsinntekt ?? [];

  // Siste 3 år (36 mnd)
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 36, 1);

  const rows = alle
    .filter((r) => {
      const d = parse(r.periode ?? "", "yyyy-MM", new Date());
      return isValidDate(d) && d >= cutoff;
    })
    .sort((a, b) =>
      (a.periode ?? "").localeCompare(b.periode ?? "", "nb", { numeric: true }),
    )
    .reverse();

  const isEmpty = rows.length === 0;

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold mb-6">Lønnsinntekt siste 3 år</h2>

      <Box>
        {isEmpty ? (
          <Alert variant="info">
            Ingen lønnsutbetalinger funnet for de siste 3 årene.
          </Alert>
        ) : (
          <>
            {/* Legend */}
            <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
              <Alert variant="warning">
                Rader markert i gult og med varselikon har flere versjoner i
                A-ordningen.
              </Alert>
            </div>

            <Table className="mt-2" zebraStripes>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                  <Table.HeaderCell scope="col">
                    Arbeidsforhold
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col">Stilling %</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Lønnstype</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Timer</Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    Beløp
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {rows.map((r, i) => {
                  const stilling = toNumber(r.stillingsprosent);
                  const timer = toNumber(r.antall);
                  const belop = toNumber(r.belop);
                  const hasVersions = !!r.harFlereVersjoner;
                  const cellStyle = hasVersions ? warnStyle : undefined;

                  return (
                    <Table.Row
                      key={`${r.arbeidsgiver}-${r.periode}-${i}`}
                      aria-label={
                        hasVersions ? "Har flere versjoner" : undefined
                      }
                    >
                      <Table.HeaderCell scope="row" style={cellStyle}>
                        <span className="inline-flex items-center gap-2">
                          {hasVersions && (
                            <ExclamationmarkTriangleFillIcon
                              aria-label="Flere versjoner"
                              title="Flere versjoner"
                              style={{ color: "var(--a-icon-warning)" }}
                              fontSize="1.125rem"
                            />
                          )}
                          <span>{r.arbeidsgiver || "–"}</span>
                        </span>
                        {hasVersions && (
                          <span className="sr-only"> (flere versjoner)</span>
                        )}
                      </Table.HeaderCell>

                      <Table.DataCell style={cellStyle}>
                        {formatYM(r.periode)}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {r.arbeidsforhold?.trim() || "–"}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {stilling !== null
                          ? `${fmtDec.format(stilling)} %`
                          : "–"}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {mapLonnstype(r.lonnstype)}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {timer !== null ? fmtDec.format(timer) : "–"}
                      </Table.DataCell>
                      <Table.DataCell
                        style={{ ...cellStyle, textAlign: "right" }}
                      >
                        {belop !== null ? fmtNOK.format(belop) : "–"}
                      </Table.DataCell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </>
        )}
      </Box>

      <ExpansionCard aria-label="Data" className="mt-6">
        <ExpansionCard.Header>
          <ExpansionCard.Title>Data</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(inntektInformasjon, null, 2)}
          </pre>
        </ExpansionCard.Content>
      </ExpansionCard>
    </div>
  );
}

const fmtNOK = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 2,
});
const fmtDec = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 });

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n =
    typeof val === "number" ? val : Number(String(val).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function formatYM(ym: string | null | undefined): string {
  if (!ym) return "–";
  const d = parse(ym, "yyyy-MM", new Date());
  return isValidDate(d) ? format(d, "MMM yyyy", { locale: nb }) : ym;
}
function mapLonnstype(raw?: string | null): string {
  if (!raw) return "–";
  const x = raw.toLowerCase();
  switch (x) {
    case "timeloenn":
      return "Timelønn";
    case "fastloenn":
      return "Fastlønn";
    case "overtidsgodtgjoerelse":
      return "Overtidsgodtgjørelse";
    case "feriepenger":
      return "Feriepenger";
    case "tips":
      return "Tips";
    default:
      return raw;
  }
}

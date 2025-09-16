import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Alert, Box, ExpansionCard, Table } from "@navikt/ds-react";
import { isValid as isValidDate, parse } from "date-fns";
import type { CSSProperties } from "react";
import type { InntektInformasjon } from "~/routes/oppslag/[ident]/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import { formatterDesimaltall, formatterProsent } from "~/utils/number-utils";
import { storFørsteBokstav } from "~/utils/string-utils";

// Highlight-stil for celler i rad med flere versjoner
const warnStyle: CSSProperties = {
  backgroundColor: "var(--a-surface-warning-subtle)",
  boxShadow: "inset 0 0 0 1px var(--a-border-warning-subtle)",
};

type InntektTabellOversiktProps = { inntektInformasjon: InntektInformasjon };
export default function InntektTabellOversikt({
  inntektInformasjon,
}: InntektTabellOversiktProps) {
  const alle = inntektInformasjon?.lønnsinntekt ?? [];

  // Siste 3 år (36 mnd)
  const nå = new Date();
  const cutoff = new Date(nå.getFullYear(), nå.getMonth() - 36, 1);

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
            <Alert variant="warning" className="mb-2 w-fit">
              Rader markert i gult og med varselikon har flere versjoner i
              A-ordningen.
            </Alert>

            <Table className="mt-2" zebraStripes>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                  <Table.HeaderCell scope="col">
                    Arbeidsforhold
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col">
                    Stilling&nbsp;%
                  </Table.HeaderCell>
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
                  const beløp = toNumber(r.beløp);
                  const harFlereVersjoner = Boolean(r.harFlereVersjoner);
                  const cellStyle = harFlereVersjoner ? warnStyle : undefined;

                  return (
                    <Table.Row
                      key={`${r.arbeidsgiver}-${r.periode}-${i}`}
                      aria-label={
                        harFlereVersjoner ? "Har flere versjoner" : undefined
                      }
                    >
                      <Table.HeaderCell scope="row" style={cellStyle}>
                        <span className="inline-flex items-center gap-2">
                          {harFlereVersjoner && (
                            <ExclamationmarkTriangleFillIcon
                              aria-label="Flere versjoner"
                              title="Flere versjoner"
                              style={{ color: "var(--a-icon-warning)" }}
                              fontSize="1.125rem"
                            />
                          )}
                          <span>{r.arbeidsgiver || "–"}</span>
                        </span>
                        {harFlereVersjoner && (
                          <span className="sr-only"> (flere versjoner)</span>
                        )}
                      </Table.HeaderCell>

                      <Table.DataCell style={cellStyle}>
                        {formatÅrMåned(r.periode)}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {r.arbeidsforhold?.trim() || "–"}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {stilling !== null ? formatterProsent(stilling) : "–"}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {camelCaseTilNorsk(r.lønnstype)}
                      </Table.DataCell>
                      <Table.DataCell style={cellStyle}>
                        {timer !== null
                          ? formatterDesimaltall(timer, 0, 2)
                          : "–"}
                      </Table.DataCell>
                      <Table.DataCell
                        style={{ ...cellStyle, textAlign: "right" }}
                      >
                        {beløp !== null ? fmtNOK.format(beløp) : "–"}
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

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n =
    typeof val === "number" ? val : Number(String(val).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function camelCaseTilNorsk(camelCaseStr: string | null) {
  if (!camelCaseStr) {
    return "";
  }

  const ord = camelCaseStr
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(" ");

  // Bytt ut ae, aa og oe med æ, å og ø
  const norskeOrd = ord.map((hvertOrd) =>
    hvertOrd.replace(/oe/g, "ø").replace(/aa/g, "å").replace(/ae/g, "æ"),
  );

  return storFørsteBokstav(norskeOrd.join(" "));
}

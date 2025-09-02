"use client";

import { Box, ExpansionCard, Alert, Table } from "@navikt/ds-react";
import { InntektInformasjon } from "@/app/types/Domain";
import { parse, format, isValid as isValidDate } from "date-fns";
import { nb } from "date-fns/locale";

type Props = {
    inntektInformasjon: InntektInformasjon;
};

const fmtNOK = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 2,
});
const fmtDec = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 });

function toNumber(val: unknown): number | null {
    if (val === null || val === undefined || val === "") return null;
    const n = typeof val === "number" ? val : Number(String(val).replace(",", "."));
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

export default function InntektTabellOversikt({ inntektInformasjon }: Props) {
    const alle = inntektInformasjon?.loennsinntekt ?? [];

    // Siste 3 år (36 mnd) fra i dag
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 36, 1);

    const rows = alle
        .filter((r) => {
            const d = parse(r.periode ?? "", "yyyy-MM", new Date());
            return isValidDate(d) && d >= cutoff;
        })
        .sort((a, b) => (a.periode ?? "").localeCompare(b.periode ?? "", "nb", { numeric: true }))
        .reverse(); // nyest først

    const isEmpty = rows.length === 0;

    return (
        <div className="p-6">
            <h2 className="text-4xl font-bold mb-6">Lønnsinntekt siste 3 år</h2>

            <Box>
                {isEmpty ? (
                    <Alert variant="info">Ingen lønnsutbetalinger funnet for de siste 3 årene.</Alert>
                ) : (
                    <Table className="mt-2" zebraStripes>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Arbeidsforhold</Table.HeaderCell>
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
                                return (
                                    <Table.Row key={`${r.arbeidsgiver}-${r.periode}-${i}`}>
                                        <Table.HeaderCell scope="row">{r.arbeidsgiver || "–"}</Table.HeaderCell>
                                        <Table.DataCell>{formatYM(r.periode)}</Table.DataCell>
                                        <Table.DataCell>{r.arbeidsforhold?.trim() || "–"}</Table.DataCell>
                                        <Table.DataCell>
                                            {stilling !== null ? `${fmtDec.format(stilling)} %` : "–"}
                                        </Table.DataCell>
                                        <Table.DataCell>{mapLonnstype(r.lonnstype)}</Table.DataCell>
                                        <Table.DataCell>{timer !== null ? fmtDec.format(timer) : "–"}</Table.DataCell>
                                        <Table.DataCell align="right">
                                            {belop !== null ? fmtNOK.format(belop) : "–"}
                                        </Table.DataCell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
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

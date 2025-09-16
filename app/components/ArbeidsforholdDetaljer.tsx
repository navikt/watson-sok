import { Alert, Table, Tag } from "@navikt/ds-react";
import { format, parse } from "date-fns";
import { nb } from "date-fns/locale";
import type { ArbeidsgiverInformasjon } from "~/routes/oppslag/[ident]/schemas";

type Props = {
  arbeidsgiverInformasjon?: ArbeidsgiverInformasjon | null;
  fnr?: string; // brukes kun i key-generering hvis du vil
};

function formatMonth(ym: string | null | undefined) {
  if (!ym) return "–";
  // ym kommer som "YYYY-MM"
  try {
    const d = parse(ym, "yyyy-MM", new Date());
    return format(d, "MMM yyyy", { locale: nb });
  } catch {
    return ym;
  }
}

export function ArbeidsforholdDetaljer({
  arbeidsgiverInformasjon,
  fnr = "",
}: Props) {
  const løpende = arbeidsgiverInformasjon?.løpendeArbeidsforhold ?? [];

  // Flater ut alle (arbeidsgiver x ansettelsesDetalj) til rad-objekter
  const rows = [...løpende].flatMap((ag) =>
    (ag.ansettelsesDetaljer ?? []).map((det, idx) => ({
      key: `${ag.organisasjonsnummer ?? ag.arbeidsgiver}-${det.periode.fom}-${det.periode.tom ?? "pågår"}-${idx}-${fnr}`,
      arbeidsgiver: ag.arbeidsgiver,
      start: det.periode.fom,
      slutt: det.periode.tom,
      stillingsprosent: det.stillingsprosent ?? null,
      arbeidsforholdType: det.type ?? null,
      yrke: det.yrke,
      løpende: !det.periode.tom,
    })),
  );

  // Sortér nyeste start først
  rows.sort((a, b) => (a.start > b.start ? -1 : a.start < b.start ? 1 : 0));

  if (rows.length === 0) {
    return (
      <Alert variant="info" className="mt-4">
        Ingen arbeidsforhold funnet.
      </Alert>
    );
  }

  return (
    <Table className="mt-4">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
          <Table.HeaderCell scope="col">Start</Table.HeaderCell>
          <Table.HeaderCell scope="col">Slutt</Table.HeaderCell>
          <Table.HeaderCell scope="col">Stilling %</Table.HeaderCell>
          <Table.HeaderCell scope="col">Arbeidsforhold</Table.HeaderCell>
          <Table.HeaderCell scope="col">Yrke</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((r) => (
          <Table.Row key={r.key}>
            <Table.HeaderCell scope="row">
              {r.arbeidsgiver}{" "}
              {r.løpende && (
                <Tag size="small" variant="success" className="ml-2">
                  Løpende
                </Tag>
              )}
            </Table.HeaderCell>
            <Table.DataCell>{formatMonth(r.start)}</Table.DataCell>
            <Table.DataCell>
              {r.slutt ? formatMonth(r.slutt) : "–"}
            </Table.DataCell>
            <Table.DataCell>
              {typeof r.stillingsprosent === "number"
                ? `${r.stillingsprosent}%`
                : "–"}
            </Table.DataCell>
            <Table.DataCell>{r.arbeidsforholdType ?? "–"}</Table.DataCell>
            <Table.DataCell>{r.yrke ?? "–"}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

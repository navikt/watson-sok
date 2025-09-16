import { Alert, Table, Tag } from "@navikt/ds-react";
import type { ArbeidsgiverInformasjon } from "~/routes/oppslag/[ident]/schemas";

type Props = {
  arbeidsgiverInformasjon?: ArbeidsgiverInformasjon | null;
  fnr?: string; // brukes kun i key-generering hvis du vil
};

function formatÅrMåned(årMåned: string | null | undefined) {
  if (!årMåned || !årMåned.match(/^\d{4}-\d{2}$/)) {
    return "–";
  }
  try {
    const formatter = new Intl.DateTimeFormat("nb-NO", {
      month: "short",
      year: "numeric",
    });
    return formatter.format(new Date(`${årMåned}-01`));
  } catch {
    return årMåned;
  }
}

export function ArbeidsforholdDetaljer({
  arbeidsgiverInformasjon,
  fnr = "",
}: Props) {
  const løpende = arbeidsgiverInformasjon?.løpendeArbeidsforhold ?? [];

  // Flater ut alle (arbeidsgiver x ansettelsesDetalj) til rad-objekter
  const rows = [...løpende].flatMap((ag) =>
    (ag.ansettelsesDetaljer ?? []).map((detalj, idx) => ({
      key: `${ag.organisasjonsnummer ?? ag.arbeidsgiver}-${detalj.periode.fom}-${detalj.periode.tom ?? "pågår"}-${idx}-${fnr}`,
      arbeidsgiver: ag.arbeidsgiver,
      start: detalj.periode.fom,
      slutt: detalj.periode.tom,
      stillingsprosent: detalj.stillingsprosent ?? null,
      arbeidsforholdType: detalj.type ?? null,
      yrke: detalj.yrke,
      løpende: !detalj.periode.tom,
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
          <Table.HeaderCell scope="col">Stilling&nbsp;%</Table.HeaderCell>
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
            <Table.DataCell>{formatÅrMåned(r.start)}</Table.DataCell>
            <Table.DataCell>
              {r.slutt ? formatÅrMåned(r.slutt) : "–"}
            </Table.DataCell>
            <Table.DataCell>
              {mapStillingsprosent(r.stillingsprosent ?? "-")}
            </Table.DataCell>
            <Table.DataCell>
              {mapArbeidsforholdType(r.arbeidsforholdType ?? "–")}
            </Table.DataCell>
            <Table.DataCell>{mapYrke(r.yrke ?? "–")}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

function mapArbeidsforholdType(type: string) {
  switch (type) {
    case "Ordinaer":
      return "Ordinær";
    case "Frilanser":
      return "Frilanser";
    default:
      return type;
  }
}

function mapYrke(yrke: string) {
  switch (yrke) {
    case "IT-KONSULENT":
      // We special
      return "IT-konsulent";
    default:
      return yrke.charAt(0).toUpperCase() + yrke.slice(1).toLowerCase();
  }
}

function mapStillingsprosent(prosent: string | number) {
  if (typeof prosent === "number") {
    return `${prosent} %`;
  }
  return prosent;
}

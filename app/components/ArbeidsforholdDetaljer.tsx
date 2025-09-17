import { Alert, Table, Tag } from "@navikt/ds-react";
import type { ArbeidsgiverInformasjon } from "~/routes/oppslag/[ident]/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import { formatterProsent } from "~/utils/number-utils";
import { storFørsteBokstav } from "~/utils/string-utils";
import { PanelContainer } from "./paneler/PanelContainer";

type Props = {
  arbeidsgiverInformasjon?: ArbeidsgiverInformasjon | null;
  fnr?: string; // brukes kun i key-generering hvis du vil
};

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
    <PanelContainer
      title="Arbeidsforhold"
      link={{ href: "https://aareg.nav.no", beskrivelse: "Historikk" }}
    >
      <div className="mt-4 max-h-[500px] overflow-y-scroll">
        <Table size="small" stickyHeader={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell textSize="small" scope="col">
                Arbeidsgiver
              </Table.HeaderCell>
              <Table.HeaderCell textSize="small" scope="col">
                Start
              </Table.HeaderCell>
              <Table.HeaderCell textSize="small" scope="col">
                Slutt
              </Table.HeaderCell>
              <Table.HeaderCell textSize="small" scope="col">
                Stilling&nbsp;%
              </Table.HeaderCell>
              <Table.HeaderCell textSize="small" scope="col">
                Arbeidsforhold
              </Table.HeaderCell>
              <Table.HeaderCell textSize="small" scope="col">
                Yrke
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((r) => (
              <Table.Row key={r.key}>
                <Table.HeaderCell scope="row" textSize="small">
                  {r.løpende && (
                    <Tag size="xsmall" variant="success" className="mr-2">
                      Løpende
                    </Tag>
                  )}
                  {r.arbeidsgiver}
                </Table.HeaderCell>
                <Table.DataCell className="whitespace-nowrap" textSize="small">
                  {formatÅrMåned(r.start)}
                </Table.DataCell>
                <Table.DataCell className="whitespace-nowrap" textSize="small">
                  {r.slutt ? formatÅrMåned(r.slutt) : "–"}
                </Table.DataCell>
                <Table.DataCell align="right" textSize="small">
                  {formatterProsent(r.stillingsprosent ?? "-")}
                </Table.DataCell>
                <Table.DataCell textSize="small">
                  {mapArbeidsforholdType(r.arbeidsforholdType ?? "–")}
                </Table.DataCell>
                <Table.DataCell textSize="small">
                  {mapYrke(r.yrke ?? "–")}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </PanelContainer>
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
      return storFørsteBokstav(yrke);
  }
}

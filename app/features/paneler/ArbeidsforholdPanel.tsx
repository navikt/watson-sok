import { Alert, Skeleton, Table } from "@navikt/ds-react";
import { use } from "react";
import type { ArbeidsgiverInformasjon } from "~/routes/oppslag/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import { formatterProsent } from "~/utils/number-utils";
import { storFørsteBokstav } from "~/utils/string-utils";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type ArbeidsforholdPanelProps = {
  promise: Promise<ArbeidsgiverInformasjon | null>;
};

export function ArbeidsforholdPanel({ promise }: ArbeidsforholdPanelProps) {
  const arbeidsgiverInformasjon = use(promise);
  const løpende = arbeidsgiverInformasjon?.løpendeArbeidsforhold ?? [];

  // Flater ut alle (arbeidsgiver x ansettelsesDetalj) til rad-objekter
  const rows = [...løpende].flatMap((ag) =>
    (ag.ansettelsesDetaljer ?? []).map((detalj, idx) => ({
      key: `${ag.organisasjonsnummer ?? ag.arbeidsgiver}-${detalj.periode.fom}-${detalj.periode.tom ?? "pågår"}-${idx}`,
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
      <Alert variant="info" className="h-fit">
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
        <Table size="medium" stickyHeader={true}>
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
                <Table.HeaderCell
                  scope="row"
                  textSize="small"
                  title={
                    r.løpende ? "Dette er et løpende arbeidsforhold" : undefined
                  }
                  className={
                    r.løpende ? "border-l-6 border-l-ax-success-500" : undefined
                  }
                >
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

export const ArbeidsforholdPanelSkeleton = () => {
  const kolonner = Array.from({ length: 6 }, (_, index) => index);
  const rader = Array.from({ length: 8 }, (_, index) => index);
  return (
    <PanelContainerSkeleton
      title="Arbeidsforhold"
      link={{ href: "https://aareg.nav.no", beskrivelse: "Historikk" }}
    >
      <Table size="medium" stickyHeader={true}>
        <Table.Header>
          <Table.Row>
            {kolonner.map((_, idx) => (
              <Table.HeaderCell key={idx} textSize="small" scope="col">
                <Skeleton variant="text" width="60%" />
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rader.map((_, idx) => (
            <Table.Row key={idx}>
              {kolonner.map((_, idx) => (
                <Table.DataCell key={idx} textSize="small">
                  <Skeleton variant="text" width="100%" />
                </Table.DataCell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </PanelContainerSkeleton>
  );
};

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

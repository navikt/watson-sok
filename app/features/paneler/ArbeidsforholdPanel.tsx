import { Alert, Skeleton, Table } from "@navikt/ds-react";
import { use, useMemo } from "react";
import type { ArbeidsgiverInformasjon } from "~/routes/oppslag/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import { formatterProsent } from "~/utils/number-utils";
import { storFørsteBokstav } from "~/utils/string-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type ArbeidsforholdPanelProps = {
  promise: Promise<ArbeidsgiverInformasjon | null>;
};

export function ArbeidsforholdPanel({ promise }: ArbeidsforholdPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<ArbeidsforholdPanelSkeleton />}>
      <ArbeidsforholdPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type ArbeidsforholdPanelMedDataProps = {
  promise: Promise<ArbeidsgiverInformasjon | null>;
};
const ArbeidsforholdPanelMedData = ({
  promise,
}: ArbeidsforholdPanelMedDataProps) => {
  const arbeidsgiverInformasjon = use(promise);
  const løpende = arbeidsgiverInformasjon?.løpendeArbeidsforhold ?? [];

  // Flater ut alle (arbeidsgiver x ansettelsesDetalj) til rad-objekter
  const arbeidsforhold = [...løpende].flatMap((ag) =>
    (ag.ansettelsesDetaljer ?? []).map((detalj, idx) => ({
      key: `${ag.organisasjonsnummer ?? ag.arbeidsgiver}-${detalj.periode.fom}-${detalj.periode.tom ?? "pågår"}-${idx}`,
      arbeidsgiver: ag.arbeidsgiver,
      organisasjonsnummer: ag.organisasjonsnummer,
      start: detalj.periode.fom,
      slutt: detalj.periode.tom,
      stillingsprosent: detalj.stillingsprosent ?? null,
      arbeidsforholdType: detalj.type ?? null,
      yrke: detalj.yrke,
      løpende: !detalj.periode.tom,
    })),
  );

  const sammenslåtteArbeidsforhold = useMemo(
    () => slåSammenTilstøtendePerioder(arbeidsforhold),
    [arbeidsforhold],
  );

  // Sortér nyeste start først
  sammenslåtteArbeidsforhold.sort((a, b) =>
    a.start > b.start ? -1 : a.start < b.start ? 1 : 0,
  );

  if (sammenslåtteArbeidsforhold.length === 0) {
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
            {sammenslåtteArbeidsforhold.map((r) => (
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
};

const ArbeidsforholdPanelSkeleton = () => {
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

// Sjekker om to perioder er sammenhengende (32 dager eller mindre mellom dem)
function erPerioderSammenhengende(
  sluttDato: string | null,
  startDato: string,
): boolean {
  if (!sluttDato) return false; // Hvis første periode er pågående, er de ikke sammenhengende

  // Parse datoer (format: YYYY-MM) og regn ut forskjellen i dager
  const slutt = new Date(`${sluttDato}-01`);
  const start = new Date(`${startDato}-01`);

  const diffMs = start.getTime() - slutt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays > 0 && diffDays <= 32;
}

// Slår sammen sammenhengende arbeidsforhold for samme arbeidsgiver
function slåSammenTilstøtendePerioder(
  rader: Array<{
    key: string;
    arbeidsgiver: string;
    organisasjonsnummer: string;
    start: string;
    slutt: string | null;
    stillingsprosent: number | null;
    arbeidsforholdType: string | null;
    yrke: string | null;
    løpende: boolean;
  }>,
) {
  // Gruppér etter arbeidsgiver (bruker organisasjonsnummer)
  const gruppert = new Map<
    string,
    Array<{
      key: string;
      arbeidsgiver: string;
      organisasjonsnummer: string;
      start: string;
      slutt: string | null;
      stillingsprosent: number | null;
      arbeidsforholdType: string | null;
      yrke: string | null;
      løpende: boolean;
    }>
  >();

  for (const rad of rader) {
    const nøkkel = rad.organisasjonsnummer ?? rad.arbeidsgiver;
    if (!gruppert.has(nøkkel)) {
      gruppert.set(nøkkel, []);
    }
    gruppert.get(nøkkel)?.push(rad);
  }

  // For hver arbeidsgiver, slå sammen sammenhengende perioder
  const sammenslåtteRader: typeof rader = [];

  for (const [_, arbeidsgiverRader] of gruppert) {
    // Sortér etter startdato (eldste først for merging)
    arbeidsgiverRader.sort((a, b) =>
      a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
    );

    let tmpSammenslått = arbeidsgiverRader[0];

    for (let i = 1; i < arbeidsgiverRader.length; i++) {
      const nesteRad = arbeidsgiverRader[i];

      // Sjekk om denne perioden er sammenhengende og har samme detaljer
      const erSammenhengendeTid = erPerioderSammenhengende(
        tmpSammenslått.slutt,
        nesteRad.start,
      );
      const harSammeDetaljer =
        tmpSammenslått.stillingsprosent === nesteRad.stillingsprosent &&
        tmpSammenslått.arbeidsforholdType === nesteRad.arbeidsforholdType &&
        tmpSammenslått.yrke === nesteRad.yrke;

      if (erSammenhengendeTid && harSammeDetaljer) {
        // Slå sammen: utvid sluttdato
        tmpSammenslått = {
          ...tmpSammenslått,
          key: `${tmpSammenslått.key}-merged-${nesteRad.key}`,
          slutt: nesteRad.slutt,
          løpende: nesteRad.løpende,
        };
      } else {
        // Ikke sammenhengende eller ulike detaljer - legg til som egen periode
        sammenslåtteRader.push(tmpSammenslått);
        tmpSammenslått = nesteRad;
      }
    }

    // Ikke glem å legge til den siste sammenslåtte perioden
    sammenslåtteRader.push(tmpSammenslått);
  }

  return sammenslåtteRader;
}

import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Alert, Skeleton, Switch, Table } from "@navikt/ds-react";
import { use, useMemo, useState, type CSSProperties } from "react";
import type { InntektInformasjon, Ytelse } from "~/routes/oppslag/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import {
  formatterBeløp,
  formatterDesimaltall,
  konverterTilTall,
} from "~/utils/number-utils";
import { camelCaseTilNorsk, storFørsteBokstav } from "~/utils/string-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";
import { mapYtelsestypeTilIkon } from "./mapYtelsestypeTilIkon";

// Highlight-stil for celler i rad med flere versjoner
const warnStyle: CSSProperties = {
  backgroundColor: "var(--ax-bg-warning-soft)",
  boxShadow: "inset 0 0 0 1px var(--a-border-warning-subtle)",
};

type InntektPanelProps = {
  promise: Promise<InntektInformasjon | null>;
  ytelserPromise: Promise<Ytelse[] | null>;
};
export function InntektPanel({ promise, ytelserPromise }: InntektPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<InntektPanelSkeleton />}>
      <InntektPanelMedData promise={promise} ytelserPromise={ytelserPromise} />
    </ResolvingComponent>
  );
}

type InntektPanelMedDataProps = {
  promise: Promise<InntektInformasjon | null>;
  ytelserPromise: Promise<Ytelse[] | null>;
};
const InntektPanelMedData = ({
  promise,
  ytelserPromise,
}: InntektPanelMedDataProps) => {
  const inntektInformasjon = use(promise);
  const ytelser = use(ytelserPromise);
  const [visYtelser, setVisYtelser] = useState(false);

  const rader = useMemo(() => {
    const nå = new Date();
    const cutoff = new Date(nå.getFullYear(), nå.getMonth() - 36, 1);
    const inntekterFraAareg = inntektInformasjon?.lønnsinntekt ?? [];
    const ytelserFraNav =
      ytelser?.flatMap((ytelse) =>
        ytelse.perioder.map((periode) => ({
          arbeidsgiver: "Nav",
          lønnstype: ytelse.stonadType,
          antall: null,
          periode: periode.periode.fom.substring(0, 7),
          harFlereVersjoner: false,
          beløp: periode.beløp,
        })),
      ) || [];
    const inntekterTilMapping = visYtelser
      ? [...ytelserFraNav, ...inntekterFraAareg]
      : inntekterFraAareg;
    return inntekterTilMapping
      .filter((r) => {
        const dato = new Date(`${r.periode}-01`);
        return !Number.isNaN(dato.getTime()) && dato >= cutoff;
      })
      .sort((a, b) =>
        (a.periode ?? "").localeCompare(b.periode ?? "", "nb", {
          numeric: true,
        }),
      )
      .reverse();
  }, [inntektInformasjon?.lønnsinntekt, ytelser, visYtelser]);

  const erTom = rader.length === 0;

  return (
    <PanelContainer
      title="Inntekt"
      link={{ href: "https://aareg.nav.no", beskrivelse: "Historikk" }}
    >
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
          {ytelser && ytelser.length > 0 && (
            <div className="flex justify-end py-2 pr-2">
              <Switch
                checked={visYtelser}
                onChange={() => setVisYtelser(!visYtelser)}
                position="right"
              >
                Vis ytelser fra Nav
              </Switch>
            </div>
          )}
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
                            style={{
                              color: "var(--ax-text-warning-decoration)",
                            }}
                            fontSize="1.125rem"
                          />
                        )}
                        {r.arbeidsgiver === "Nav" && (
                          <span className="inline-flex items-center gap-2">
                            {mapYtelsestypeTilIkon(r.lønnstype ?? "")}
                          </span>
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
};

const InntektPanelSkeleton = () => {
  const kolonner = Array.from({ length: 5 }, (_, index) => index);
  const rader = Array.from({ length: 4 }, (_, index) => index);
  return (
    <PanelContainerSkeleton
      title="Inntekt"
      link={{ href: "https://aareg.nav.no", beskrivelse: "Historikk" }}
    >
      <Skeleton variant="rounded" width="100%" height="4rem" />
      <Table size="medium">
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

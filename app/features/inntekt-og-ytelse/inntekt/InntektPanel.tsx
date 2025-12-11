import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Alert, Skeleton, Switch, Table } from "@navikt/ds-react";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { use, useMemo, useState, type CSSProperties } from "react";
import { ResolvingComponent } from "~/features/async/ResolvingComponent";
import type { Ytelse } from "~/features/inntekt-og-ytelse/ytelse/domene";
import { mapYtelsestypeTilIkon } from "~/features/inntekt-og-ytelse/ytelse/mapYtelsestypeTilIkon";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/features/paneler/PanelContainer";
import { formaterÅrMåned } from "~/utils/date-utils";
import {
  formaterBeløp,
  formaterDesimaltall,
  konverterTilTall,
} from "~/utils/number-utils";
import { camelCaseTilNorsk, storFørsteBokstav } from "~/utils/string-utils";
import type { InntektInformasjon } from "./domene";

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
    <PanelContainer title="Inntekt">
      {erTom ? (
        <Alert variant="info">
          Ingen lønnsutbetalinger funnet for de siste 3 årene.
        </Alert>
      ) : (
        <div className="mt-4">
          {ytelser && ytelser.length > 0 && (
            <div className="flex justify-end absolute top-2 right-4">
              <Switch
                checked={visYtelser}
                onChange={() => setVisYtelser(!visYtelser)}
                position="right"
              >
                Vis ytelser fra Nav
              </Switch>
            </div>
          )}
          <div
            tabIndex={0}
            className="max-h-[500px] overflow-y-scroll print:max-h-none print:overflow-y-auto"
          >
            <Table size="medium" stickyHeader={true}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col" textSize="small">
                    Periode
                  </TableHeaderCell>
                  <TableHeaderCell scope="col" textSize="small">
                    Arbeidsgiver
                  </TableHeaderCell>
                  <TableHeaderCell scope="col" textSize="small">
                    Lønnstype
                  </TableHeaderCell>
                  <TableHeaderCell scope="col" textSize="small">
                    Antall
                  </TableHeaderCell>
                  <TableHeaderCell scope="col" align="right" textSize="small">
                    Beløp
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rader.map((r, i) => {
                  const timer = konverterTilTall(r.antall);
                  const beløp = konverterTilTall(r.beløp);
                  const harFlereVersjoner = Boolean(r.harFlereVersjoner);
                  const cellStyle = harFlereVersjoner ? warnStyle : undefined;

                  return (
                    <TableRow
                      key={`${r.arbeidsgiver}-${r.periode}-${i}`}
                      title={
                        harFlereVersjoner
                          ? "Har flere versjoner i A-registeret"
                          : undefined
                      }
                    >
                      <TableHeaderCell
                        scope="row"
                        style={cellStyle}
                        textSize="small"
                      >
                        <span className="inline-flex items-center gap-2">
                          {harFlereVersjoner && (
                            <ExclamationmarkTriangleFillIcon
                              aria-hidden={true}
                              style={{
                                color: "var(--ax-text-warning-decoration)",
                              }}
                              fontSize="1.125rem"
                            />
                          )}
                          {r.arbeidsgiver === "Nav" &&
                            mapYtelsestypeTilIkon(r.lønnstype ?? "")}
                          <span>
                            {storFørsteBokstav(formaterÅrMåned(r.periode))}
                          </span>
                          {harFlereVersjoner && (
                            <span className="sr-only"> (flere versjoner)</span>
                          )}
                        </span>
                      </TableHeaderCell>
                      <TableDataCell style={cellStyle} textSize="small">
                        {r.arbeidsgiver || "–"}
                      </TableDataCell>
                      <TableDataCell style={cellStyle} textSize="small">
                        {camelCaseTilNorsk(r.lønnstype)}
                      </TableDataCell>
                      <TableDataCell style={cellStyle} textSize="small">
                        {timer !== null
                          ? formaterDesimaltall(timer, 0, 2)
                          : "–"}
                      </TableDataCell>
                      <TableDataCell
                        style={{ ...cellStyle, textAlign: "right" }}
                        textSize="small"
                      >
                        {beløp !== null ? formaterBeløp(beløp) : "–"}
                      </TableDataCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
        <TableHeader>
          <TableRow>
            {kolonner.map((_, idx) => (
              <TableHeaderCell
                key={idx}
                textSize="small"
                scope="col"
                aria-hidden={true}
              >
                <Skeleton variant="text" width="60%" />
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rader.map((_, idx) => (
            <TableRow key={idx}>
              {kolonner.map((_, idx) => (
                <TableDataCell key={idx} textSize="small" aria-hidden={true}>
                  <Skeleton variant="text" width="100%" />
                </TableDataCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PanelContainerSkeleton>
  );
};

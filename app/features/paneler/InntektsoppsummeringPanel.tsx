import {
  Alert,
  BodyShort,
  Heading,
  Label,
  Select,
  Skeleton,
  Table,
} from "@navikt/ds-react";
import { use, useId, useMemo, useState } from "react";
import type { InntektInformasjon } from "~/routes/oppslag/schemas";
import { formatÅrMåned } from "~/utils/date-utils";
import {
  formatterBeløp,
  formatterDesimaltall,
  formatterProsent,
  konverterTilTall,
} from "~/utils/number-utils";
import { camelCaseTilNorsk } from "~/utils/string-utils";
import { ResolvingComponent } from "../async/ResolvingComponent";
import { PanelContainer, PanelContainerSkeleton } from "./PanelContainer";

type InntektsoppsummeringPanelProps = {
  promise: Promise<InntektInformasjon | null>;
};

type AggregertInntekt = {
  typeLabel: string;
  beløp: number;
  periode: string;
  dato: Date;
  utbetaler: string;
};

type AggregertResultat = {
  totalBeløp: number;
  gjennomsnittPerMåned: number | null;
  månederMedUtbetaling: number;
  periodeTekst: string;
  lønnstyper: {
    label: string;
    sum: number;
    andel: number;
    antallUtbetalinger: number;
  }[];
  toppUtbetalere: {
    navn: string;
    sum: number;
  }[];
};

const KILDER = [
  { key: "lønnsinntekt", fallbackLabel: "Annet (lønnsinntekt)" },
  { key: "næringsinntekt", fallbackLabel: "Næringsinntekt" },
  { key: "pensjonEllerTrygd", fallbackLabel: "Pensjon og trygd" },
  { key: "ytelseFraOffentlige", fallbackLabel: "Offentlige ytelser" },
] as const satisfies ReadonlyArray<{
  key: keyof InntektInformasjon;
  fallbackLabel: string;
}>;

const PERIODE_ALTERNATIVER = [
  {
    label: "3 måneder",
    value: 3,
  },
  {
    label: "6 måneder",
    value: 6,
  },
  {
    label: "1 år",
    value: 12,
  },
  {
    label: "2 år",
    value: 24,
  },
  {
    label: "3 år",
    value: 36,
  },
] as const;
const DEFAULT_ANTALL_MÅNEDER =
  PERIODE_ALTERNATIVER[PERIODE_ALTERNATIVER.length - 1].value;
const TOPP_UTBETALERE_ANTALL = 3;

export function InntektsoppsummeringPanel({
  promise,
}: InntektsoppsummeringPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<InntektsoppsummeringPanelSkeleton />}>
      <InntektsoppsummeringPanelMedData promise={promise} />
    </ResolvingComponent>
  );
}

type InntektsoppsummeringPanelMedDataProps = {
  promise: Promise<InntektInformasjon | null>;
};
const InntektsoppsummeringPanelMedData = ({
  promise,
}: InntektsoppsummeringPanelMedDataProps) => {
  const inntektInformasjon = use(promise);
  const [antallMåneder, setAntallMåneder] = useState(DEFAULT_ANTALL_MÅNEDER);

  const aggregert = useMemo<AggregertResultat | null>(() => {
    if (!inntektInformasjon) {
      return null;
    }

    const cutoff = new Date();
    cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setMonth(cutoff.getMonth() - antallMåneder);

    const allePoster: AggregertInntekt[] = [];

    KILDER.forEach(({ key, fallbackLabel }) => {
      const poster = inntektInformasjon[key] ?? [];

      poster.forEach((rad) => {
        const beløp = konverterTilTall(rad.beløp);
        if (beløp === null) {
          return;
        }

        const periode = rad.periode?.substring(0, 7);
        if (!periode) {
          return;
        }

        const dato = new Date(`${periode}-01`);
        if (Number.isNaN(dato.getTime())) {
          return;
        }

        allePoster.push({
          typeLabel:
            (typeof rad.lønnstype === "string" && rad.lønnstype.trim()) ||
            fallbackLabel,
          beløp,
          periode,
          dato,
          utbetaler:
            rad.arbeidsgiver ??
            rad.arbeidsforhold ??
            rad.lønnstype ??
            "Ukjent utbetaler",
        });
      });
    });

    const relevantePoster = allePoster.filter(
      (rad) => rad.dato >= cutoff && rad.beløp !== 0,
    );

    if (relevantePoster.length === 0) {
      return null;
    }

    const totalBeløp = relevantePoster.reduce((sum, rad) => sum + rad.beløp, 0);
    const unikePerioder = new Set(relevantePoster.map((rad) => rad.periode));
    const sortertePerioder = Array.from(unikePerioder).sort();
    const gjennomsnittPerMåned =
      unikePerioder.size > 0 ? totalBeløp / unikePerioder.size : null;

    const beløpPerLønnstype = new Map<
      string,
      { sum: number; antallUtbetalinger: number }
    >();
    relevantePoster.forEach((rad) => {
      const nøkkel = rad.typeLabel;
      const eksisterende = beløpPerLønnstype.get(nøkkel) ?? {
        sum: 0,
        antallUtbetalinger: 0,
      };
      beløpPerLønnstype.set(nøkkel, {
        sum: eksisterende.sum + rad.beløp,
        antallUtbetalinger: eksisterende.antallUtbetalinger + 1,
      });
    });

    const lønnstyper = Array.from(beløpPerLønnstype.entries())
      .map(([label, verdier]) => ({
        label,
        sum: verdier.sum,
        antallUtbetalinger: verdier.antallUtbetalinger,
        andel: totalBeløp === 0 ? 0 : (verdier.sum / totalBeløp) * 100,
      }))
      .sort((a, b) => b.sum - a.sum);

    const beløpPerUtbetaler = new Map<string, number>();
    relevantePoster.forEach((rad) => {
      const nåværende = beløpPerUtbetaler.get(rad.utbetaler) ?? 0;
      beløpPerUtbetaler.set(rad.utbetaler, nåværende + rad.beløp);
    });

    const toppUtbetalere = Array.from(beløpPerUtbetaler.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOPP_UTBETALERE_ANTALL)
      .map(([navn, sum]) => ({ navn, sum }));

    const førstePeriode = sortertePerioder[0] ?? null;
    const sistePeriode =
      sortertePerioder[sortertePerioder.length - 1] ?? førstePeriode;
    const periodeTekst =
      førstePeriode && sistePeriode && sortertePerioder.length >= 2
        ? `${formatÅrMåned(førstePeriode)} – ${formatÅrMåned(sistePeriode)}`
        : formatÅrMåned(førstePeriode);

    return {
      totalBeløp,
      gjennomsnittPerMåned,
      månederMedUtbetaling: unikePerioder.size,
      periodeTekst,
      lønnstyper,
      toppUtbetalere,
    };
  }, [inntektInformasjon, antallMåneder]);

  const harIngenInntekter = !aggregert;

  return (
    <PanelContainer title="Inntekts&shy;oppsummering" isBeta={true}>
      <div className="flex justify-end mb-4 static lg:absolute lg:top-4 lg:right-4">
        <Select
          label="Velg tidsperiode"
          hideLabel
          size="small"
          value={String(antallMåneder)}
          onChange={(event) => {
            const valgt = Number(event.target.value);
            setAntallMåneder(
              valgt as (typeof PERIODE_ALTERNATIVER)[number]["value"],
            );
          }}
          className="w-full lg:w-48"
        >
          {PERIODE_ALTERNATIVER.map((alternativ) => (
            <option key={alternativ.value} value={alternativ.value}>
              {alternativ.label}
            </option>
          ))}
        </Select>
      </div>
      {harIngenInntekter ? (
        <Alert variant="info">
          Ingen utbetalinger registrert de siste {antallMåneder} månedene.
        </Alert>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatistikkKort
              label={`Total inntekt (siste ${antallMåneder} mnd)`}
              verdi={formatterBeløp(aggregert.totalBeløp, 0)}
              beskrivelse={aggregert.periodeTekst}
            />
            <StatistikkKort
              label="Snitt per måned"
              verdi={
                aggregert.gjennomsnittPerMåned !== null
                  ? formatterBeløp(aggregert.gjennomsnittPerMåned, 0)
                  : "–"
              }
              beskrivelse={`${aggregert.månederMedUtbetaling} mnd med utbetaling`}
            />
          </div>

          <div>
            <Heading level="3" size="small" spacing>
              Fordeling per lønnstype
            </Heading>
            <Table size="small">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Lønnstype</Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    Sum
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    Andel
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    Antall utbetalinger
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {aggregert.lønnstyper.map((lønnstype) => (
                  <Table.Row key={lønnstype.label}>
                    <Table.HeaderCell scope="row">
                      {camelCaseTilNorsk(lønnstype.label)}
                    </Table.HeaderCell>
                    <Table.DataCell align="right">
                      {formatterBeløp(lønnstype.sum, 0)}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {formatterProsent(lønnstype.andel)}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {formatterDesimaltall(lønnstype.antallUtbetalinger, 0, 0)}
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {aggregert.toppUtbetalere.length > 0 && (
            <div>
              <Heading level="3" size="small" spacing>
                Største utbetalere
              </Heading>
              <ol className="flex flex-col gap-2">
                {aggregert.toppUtbetalere.map((utbetaler, indeks) => (
                  <li
                    key={utbetaler.navn}
                    className="flex items-baseline justify-between gap-4 rounded-md border border-ax-neutral-200 px-3 py-2"
                  >
                    <span className="flex items-baseline gap-3">
                      <Label size="small">{indeks + 1}.</Label>
                      <BodyShort size="small">{utbetaler.navn}</BodyShort>
                    </span>
                    <BodyShort size="small">
                      {formatterBeløp(utbetaler.sum, 0)}
                    </BodyShort>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </PanelContainer>
  );
};

const StatistikkKort = ({
  label,
  verdi,
  beskrivelse,
}: {
  label: string;
  verdi: string;
  beskrivelse?: string;
}) => {
  const id = useId();
  const labelId = `${id}-label`;
  const beskrivelseId = `${id}-beskrivelse`;
  return (
    <div className="rounded-lg border border-ax-neutral-200 bg-ax-surface-subtle p-4">
      <Label as="span" size="small" id={labelId}>
        {label}
      </Label>
      <BodyShort
        className="text-2xl font-semibold"
        spacing
        aria-labelledby={labelId}
        aria-describedby={beskrivelse ? beskrivelseId : undefined}
      >
        {verdi}
      </BodyShort>
      {beskrivelse && (
        <BodyShort
          size="small"
          className="text-ax-text-subtle"
          id={beskrivelseId}
        >
          {beskrivelse}
        </BodyShort>
      )}
    </div>
  );
};

const InntektsoppsummeringPanelSkeleton = () => (
  <PanelContainerSkeleton title="Inntektsoppsummering">
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton variant="rounded" height="6rem" />
        <Skeleton variant="rounded" height="6rem" />
      </div>
      <Skeleton variant="rounded" height="10rem" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="rounded" height="2.5rem" />
        <Skeleton variant="rounded" height="2.5rem" />
        <Skeleton variant="rounded" height="2.5rem" />
      </div>
    </div>
  </PanelContainerSkeleton>
);

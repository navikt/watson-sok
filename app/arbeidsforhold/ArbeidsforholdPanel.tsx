import {
  InformationSquareIcon,
  MenuElipsisVerticalIcon,
} from "@navikt/aksel-icons";
import {
  ActionMenu,
  Alert,
  Button,
  CopyButton,
  Skeleton,
  Table,
} from "@navikt/ds-react";
import {
  ActionMenuContent,
  ActionMenuGroup,
  ActionMenuItem,
  ActionMenuTrigger,
} from "@navikt/ds-react/ActionMenu";
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@navikt/ds-react/Table";
import { use, useEffect, useId, useMemo, useRef, useState } from "react";

import { sporHendelse } from "~/analytics/analytics";
import { ResolvingComponent } from "~/async/ResolvingComponent";
import {
  PanelContainer,
  PanelContainerSkeleton,
} from "~/paneler/PanelContainer";
import { useDisclosure } from "~/use-disclosure/useDisclosure";
import { cn } from "~/utils/class-utils";
import { formaterÅrMåned } from "~/utils/date-utils";
import { formaterProsent } from "~/utils/number-utils";
import { formaterOrgnummer, storFørsteBokstav } from "~/utils/string-utils";

import type { ArbeidsgiverInformasjon } from "./domene";

type ArbeidsforholdRad = {
  key: string;
  id?: string;
  arbeidsgiver: string;
  organisasjonsnummer: string;
  start: string;
  slutt: string | null;
  stillingsprosent: number | null;
  arbeidsforholdType: string | null;
  yrke: string | null;
  løpende: boolean;
};

type ArbeidsforholdPanelProps = {
  promise: Promise<ArbeidsgiverInformasjon | null>;
  panelId?: string;
  ariaKeyShortcuts?: string;
};

export function ArbeidsforholdPanel({
  promise,
  panelId,
  ariaKeyShortcuts,
}: ArbeidsforholdPanelProps) {
  return (
    <ResolvingComponent loadingFallback={<ArbeidsforholdPanelSkeleton />}>
      <ArbeidsforholdPanelMedData
        promise={promise}
        panelId={panelId}
        ariaKeyShortcuts={ariaKeyShortcuts}
      />
    </ResolvingComponent>
  );
}

type ArbeidsforholdPanelMedDataProps = {
  promise: Promise<ArbeidsgiverInformasjon | null>;
  panelId?: string;
  ariaKeyShortcuts?: string;
};
const ArbeidsforholdPanelMedData = ({
  promise,
  panelId,
  ariaKeyShortcuts,
}: ArbeidsforholdPanelMedDataProps) => {
  const arbeidsgiverInformasjon = use(promise);
  const sammenslåtteArbeidsforhold = useMemo(
    () => lagArbeidsforholdRader(arbeidsgiverInformasjon),
    [arbeidsgiverInformasjon],
  );

  const {
    tabellContainerRef,
    containerId,
    harOverflow,
    visAlleArbeidsforhold,
    skalViseVisningsknapp,
    knappTekst,
    containerClassName,
    handleToggle,
  } = useArbeidsforholdOverflow();

  return (
    <PanelContainer
      title="Arbeidsforhold"
      id={panelId}
      aria-keyshortcuts={ariaKeyShortcuts}
    >
      {sammenslåtteArbeidsforhold.length === 0 ? (
        <Alert variant="info" className="h-fit">
          Ingen arbeidsforhold funnet.
        </Alert>
      ) : (
        <>
          <div
            className={containerClassName}
            id={containerId}
            ref={tabellContainerRef}
            tabIndex={-1}
          >
            <Table size="medium" stickyHeader={true}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell textSize="small" scope="col">
                    Arbeidsgiver
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col">
                    Org.nr.
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col">
                    Start
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col">
                    Slutt
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col" align="right">
                    Stilling&nbsp;%
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col">
                    Arbeidsforhold
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col">
                    Yrke
                  </TableHeaderCell>
                  <TableHeaderCell textSize="small" scope="col">
                    <span className="sr-only">Handlinger</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sammenslåtteArbeidsforhold.map((r) => (
                  <TableRow key={r.key}>
                    <TableHeaderCell
                      scope="row"
                      textSize="small"
                      title={
                        r.løpende
                          ? "Dette er et løpende arbeidsforhold"
                          : undefined
                      }
                      className={
                        r.løpende
                          ? "border-l-6 border-l-ax-success-500"
                          : undefined
                      }
                    >
                      {r.arbeidsgiver}
                    </TableHeaderCell>
                    <TableDataCell
                      className="whitespace-nowrap"
                      textSize="small"
                    >
                      <span className="inline-flex items-center gap-1">
                        {formaterOrgnummer(r.organisasjonsnummer)}
                        <CopyButton
                          copyText={r.organisasjonsnummer}
                          size="xsmall"
                        />
                      </span>
                    </TableDataCell>
                    <TableDataCell
                      className="whitespace-nowrap"
                      textSize="small"
                    >
                      {formaterÅrMåned(r.start)}
                    </TableDataCell>
                    <TableDataCell
                      className="whitespace-nowrap"
                      textSize="small"
                    >
                      {formaterÅrMåned(r.slutt)}
                    </TableDataCell>
                    <TableDataCell align="right" textSize="small">
                      {formaterProsent(r.stillingsprosent ?? "-")}
                    </TableDataCell>
                    <TableDataCell textSize="small">
                      {mapArbeidsforholdType(r.arbeidsforholdType ?? "–")}
                    </TableDataCell>
                    <TableDataCell textSize="small">
                      {mapYrke(r.yrke ?? "–")}
                    </TableDataCell>
                    <TableDataCell textSize="small">
                      <ActionMenu>
                        <ActionMenuTrigger
                          onToggle={(open) => {
                            if (open) {
                              sporHendelse(
                                "handlinger for arbeidsforhold åpnet",
                              );
                            }
                          }}
                        >
                          <Button
                            variant="tertiary"
                            size="small"
                            aria-label={`Handlinger for ${r.arbeidsgiver}`}
                            title={`Handlinger for ${r.arbeidsgiver}`}
                          >
                            <MenuElipsisVerticalIcon aria-hidden={true} />
                          </Button>
                        </ActionMenuTrigger>
                        <ActionMenuContent>
                          <ActionMenuGroup label="Relevante lenker">
                            <ActionMenuItem
                              icon={<InformationSquareIcon />}
                              as="a"
                              href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${r.organisasjonsnummer}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onSelect={() => {
                                sporHendelse(
                                  "lenke trykket brønnøysundregistrene",
                                );
                              }}
                            >
                              Brønnøysundregistrene
                            </ActionMenuItem>
                          </ActionMenuGroup>
                        </ActionMenuContent>
                      </ActionMenu>
                    </TableDataCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {harOverflow && (
              <div className="pointer-events-none h-12 absolute bottom-0 left-0 right-0 bg-linear-to-b from-transparent to-ax-bg-default" />
            )}
          </div>
          {skalViseVisningsknapp && (
            <div className="mt-2 flex justify-end print:hidden">
              <Button
                variant="secondary"
                size="small"
                type="button"
                onClick={handleToggle}
                aria-expanded={visAlleArbeidsforhold}
                aria-controls={containerId}
              >
                {knappTekst}
              </Button>
            </div>
          )}
        </>
      )}
    </PanelContainer>
  );
};

const ArbeidsforholdPanelSkeleton = () => {
  const kolonner = Array.from({ length: 8 }, (_, index) => `kolonne-${index}`);
  const rader = Array.from({ length: 5 }, (_, index) => `rad-${index}`);
  return (
    <PanelContainerSkeleton title="Arbeidsforhold">
      <Table size="medium" stickyHeader={true}>
        <TableHeader>
          <TableRow>
            {kolonner.map((kolonne) => (
              <TableHeaderCell
                key={kolonne}
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
          {rader.map((rad) => (
            <TableRow key={rad}>
              {kolonner.map((kolonne) => (
                <TableDataCell
                  key={`${rad}-${kolonne}`}
                  textSize="small"
                  aria-hidden={true}
                >
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

/**
 * Hook for å håndtere visning/skjuling av arbeidsforhold-overflow.
 * Håndterer overflow-deteksjon, toggle-funksjonalitet og relatert logikk.
 *
 * @returns Objekt med refs, state og funksjoner for overflow-håndtering
 *
 * @example
 * ```tsx
 * const {
 *   tabellContainerRef,
 *   containerId,
 *   harOverflow,
 *   visAlleArbeidsforhold,
 *   skalViseVisningsknapp,
 *   knappTekst,
 *   containerClassName,
 *   handleToggle,
 * } = useArbeidsforholdOverflow();
 * ```
 */
function useArbeidsforholdOverflow() {
  const {
    erÅpen: visAlleArbeidsforhold,
    onToggle: onToggleVisAlleArbeidsforhold,
  } = useDisclosure();
  const tabellContainerRef = useRef<HTMLDivElement | null>(null);
  const [harOverflow, setHarOverflow] = useState(false);
  const containerId = useId();

  useEffect(() => {
    const container = tabellContainerRef.current;
    if (!container) {
      return;
    }

    const oppdaterOverflow = () => {
      setHarOverflow(container.scrollHeight - container.clientHeight > 1);
    };

    oppdaterOverflow();

    const resizeObserver = new ResizeObserver(oppdaterOverflow);
    resizeObserver.observe(container);

    window.addEventListener("resize", oppdaterOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", oppdaterOverflow);
    };
  }, []);

  const skalViseVisningsknapp = harOverflow || visAlleArbeidsforhold;
  const knappTekst = visAlleArbeidsforhold
    ? "Vis færre arbeidsforhold"
    : "Vis alle arbeidsforhold";

  const containerClassName = cn(
    "relative print:max-h-none print:overflow-y-auto",
    visAlleArbeidsforhold ? "max-h-none" : "max-h-[320px] overflow-y-hidden",
  );

  const handleToggle = () => {
    onToggleVisAlleArbeidsforhold();
    tabellContainerRef.current?.scrollTo({ top: 0 });
    tabellContainerRef.current?.focus();
    sporHendelse(
      visAlleArbeidsforhold
        ? "vis færre arbeidsforhold klikket"
        : "vis alle arbeidsforhold klikket",
    );
  };

  return {
    tabellContainerRef,
    containerId,
    harOverflow,
    visAlleArbeidsforhold,
    skalViseVisningsknapp,
    knappTekst,
    containerClassName,
    handleToggle,
  };
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

function parseÅrMåned(periode: string) {
  const match = periode.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    år: Number(match[1]),
    måned: Number(match[2]),
  };
}

function nesteÅrMåned(periode: string) {
  const parsed = parseÅrMåned(periode);

  if (!parsed) {
    return null;
  }

  const { år, måned } = parsed;
  const nesteMåned = måned === 12 ? 1 : måned + 1;
  const nesteÅr = måned === 12 ? år + 1 : år;

  return `${nesteÅr}-${String(nesteMåned).padStart(2, "0")}`;
}

function erPerioderSammenhengende(
  sluttDato: string | null,
  startDato: string,
): boolean {
  if (!sluttDato) {
    return false;
  }

  return nesteÅrMåned(sluttDato) === startDato;
}

export function lagArbeidsforholdRader(
  arbeidsgiverInformasjon: ArbeidsgiverInformasjon | null | undefined,
) {
  const løpende = arbeidsgiverInformasjon?.løpendeArbeidsforhold ?? [];
  const historikk = arbeidsgiverInformasjon?.historikk ?? [];

  const arbeidsforhold = [
    ...lagRaderFraArbeidsforhold(løpende, true),
    ...lagRaderFraArbeidsforhold(historikk, false),
  ];

  return slåSammenTilstøtendePerioder(arbeidsforhold).sort((a, b) => {
    if (a.løpende && !b.løpende) return -1;
    if (!a.løpende && b.løpende) return 1;
    return a.start > b.start ? -1 : a.start < b.start ? 1 : 0;
  });
}

function lagRaderFraArbeidsforhold(
  arbeidsforhold: ArbeidsgiverInformasjon["løpendeArbeidsforhold"],
  løpende: boolean,
): ArbeidsforholdRad[] {
  return arbeidsforhold.flatMap((ag) =>
    (ag.ansettelsesDetaljer ?? []).map((detalj, idx) => ({
      key: `${ag.id ?? ag.organisasjonsnummer ?? ag.arbeidsgiver}-${detalj.periode.fom}-${detalj.periode.tom ?? "pågår"}-${idx}`,
      id: ag.id,
      arbeidsgiver: ag.arbeidsgiver,
      organisasjonsnummer: ag.organisasjonsnummer,
      start: detalj.periode.fom,
      slutt: detalj.periode.tom,
      stillingsprosent: detalj.stillingsprosent ?? null,
      arbeidsforholdType: detalj.type ?? null,
      yrke: detalj.yrke,
      løpende,
    })),
  );
}

// Slår sammen sammenhengende arbeidsforhold for samme arbeidsgiver
function slåSammenTilstøtendePerioder(rader: ArbeidsforholdRad[]) {
  // Gruppér etter arbeidsgiver (bruker id eller organisasjonsnummer om id ikke finnes)
  const gruppert = new Map<string, ArbeidsforholdRad[]>();

  for (const rad of rader) {
    const nøkkel = rad.id ?? rad.organisasjonsnummer ?? rad.arbeidsgiver;
    if (!gruppert.has(nøkkel)) {
      gruppert.set(nøkkel, []);
    }
    gruppert.get(nøkkel)?.push(rad);
  }

  // For hver arbeidsgiver, slå sammen sammenhengende perioder
  const sammenslåtteRader: typeof rader = [];

  for (const [, arbeidsgiverRader] of gruppert) {
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
        tmpSammenslått.løpende === nesteRad.løpende &&
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

import { ChevronLeftIcon, ChevronRightIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, Tooltip } from "@navikt/ds-react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@navikt/ds-react/Accordion";
import { useEffect, useMemo, useState } from "react";

import { StatistikkKort } from "~/paneler/StatistikkKort";
import {
  formaterDato,
  formaterMeldekortperiodeMedUke,
  formaterTilIsoDato,
} from "~/utils/date-utils";
import { formaterDesimaltall, formaterProsent } from "~/utils/number-utils";

import { useAapMeldekort } from "./AapMeldekortContext";
import type { AapArbeidPerDag, AapMeldekortRespons } from "./domene";
import { flatterOgFiltrerAapPerioder, type FlatAapPeriode } from "./utils";

type IndividuelleAapMeldekortAccordionProps = {
  fraDato: string;
  tilDato: string;
};

/**
 * Viser en utvidbar liste med individuelle AAP-meldekortperioder (~14 dager,
 * allerede periodisert av backend/Kelvin), inkludert en dag-for-dag-visning
 * av arbeidede timer der data finnes.
 *
 * Dag-for-dag-dataen (`arbeidPerDag`) kommer IKKE fra Kelvin selv (Kelvins
 * /maksimum-endepunkt sender alltid null for arbeidstimer), men beregnes av
 * backend fra et eget Holmes/AA-register-arbeidstimer-endepunkt. Den viser
 * derfor kun antall timer arbeidet per dag - ingen aktivitetstype
 * (Arbeid/Ferie/Kurs/Sykdom) slik dagpenger sin `IndividuelleMeldekortAccordion`
 * har, siden AAP-meldekort ikke kategoriserer daglige aktiviteter på samme
 * måte. Kan være tom for perioder uten overlappende Holmes-data.
 *
 * Forventer å bli rendret innenfor en `AapMeldekortProvider`.
 */
export function IndividuelleAapMeldekortAccordion({
  fraDato,
  tilDato,
}: IndividuelleAapMeldekortAccordionProps) {
  const aapState = useAapMeldekort();

  if (!aapState || aapState.status !== "success") {
    return null;
  }

  if (!aapState.vedtak || aapState.vedtak.length === 0) {
    return null;
  }

  return (
    <AapPeriodeVisning
      vedtak={aapState.vedtak}
      fraDato={fraDato}
      tilDato={tilDato}
    />
  );
}

type AapPeriodeVisningProps = {
  vedtak: AapMeldekortRespons;
  fraDato: string;
  tilDato: string;
};

function AapPeriodeVisning({
  vedtak,
  fraDato,
  tilDato,
}: AapPeriodeVisningProps) {
  const sortertePerioder = useMemo(
    () => flatterOgFiltrerAapPerioder(vedtak, fraDato, tilDato),
    [vedtak, fraDato, tilDato],
  );
  const [aktivIndex, setAktivIndex] = useState(0);

  useEffect(() => {
    setAktivIndex(0);
  }, [sortertePerioder.length]);

  const aktivPeriode = sortertePerioder[aktivIndex] ?? null;

  if (sortertePerioder.length === 0 || !aktivPeriode) {
    return null;
  }

  const kanGåTilForrige = aktivIndex < sortertePerioder.length - 1;
  const kanGåTilNeste = aktivIndex > 0;

  return (
    <Accordion>
      <AccordionItem>
        <AccordionHeader>
          Vis individuelle AAP-meldekort ({sortertePerioder.length})
        </AccordionHeader>
        <AccordionContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <Heading level="3" size="small">
                  Periode {formaterPeriode(aktivPeriode)}
                </Heading>
                <BodyShort size="small" textColor="subtle">
                  Vedtak: {aktivPeriode.vedtakId} – Saksnummer:{" "}
                  {aktivPeriode.saksnummer}
                </BodyShort>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  data-color="neutral"
                  icon={
                    <Tooltip
                      content={
                        kanGåTilForrige
                          ? "Forrige periode"
                          : "Ingen eldre perioder"
                      }
                    >
                      <ChevronLeftIcon aria-hidden="true" />
                    </Tooltip>
                  }
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={!kanGåTilForrige}
                  aria-label="Forrige periode"
                  onClick={() => setAktivIndex((index) => index + 1)}
                />
                <Button
                  data-color="neutral"
                  icon={
                    <Tooltip
                      content={
                        kanGåTilNeste ? "Neste periode" : "Ingen nyere perioder"
                      }
                    >
                      <ChevronRightIcon aria-hidden="true" />
                    </Tooltip>
                  }
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={!kanGåTilNeste}
                  aria-label="Neste periode"
                  onClick={() => setAktivIndex((index) => index - 1)}
                />
              </div>
            </div>
            <div>
              <Heading level="4" size="xsmall" className="mb-2">
                Dette meldekortet
              </Heading>
              <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
                <StatistikkKort
                  label="Arbeidet timer"
                  verdi={
                    aktivPeriode.arbeidetTimer != null
                      ? `${formaterDesimaltall(aktivPeriode.arbeidetTimer, 0, 1)} t`
                      : "–"
                  }
                />
                <StatistikkKort
                  label="Annen reduksjon"
                  verdi={
                    aktivPeriode.annenReduksjon != null
                      ? formaterProsent(aktivPeriode.annenReduksjon)
                      : "–"
                  }
                />
                <StatistikkKort
                  label="Utbetalingsgrad"
                  verdi={
                    aktivPeriode.utbetalingsgrad != null
                      ? formaterProsent(aktivPeriode.utbetalingsgrad)
                      : "–"
                  }
                />
              </div>
            </div>
            <AapDager
              periodeFraOgMed={aktivPeriode.fraOgMed}
              periodeTilOgMed={aktivPeriode.tilOgMed}
              arbeidPerDag={aktivPeriode.arbeidPerDag}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function formaterPeriode(periode: FlatAapPeriode): string {
  if (periode.tilOgMed) {
    return formaterMeldekortperiodeMedUke(periode.fraOgMed, periode.tilOgMed);
  }
  return `${formaterDato(periode.fraOgMed)} – pågår`;
}

type Dag = {
  dato: string;
  timer: number | null;
};

type AapDagerProps = {
  periodeFraOgMed: string;
  periodeTilOgMed: string | null | undefined;
  arbeidPerDag: AapArbeidPerDag[];
};

/**
 * Viser arbeidede timer per dag i perioden. Bygger dagrekken selv fra
 * periodens fra/til-dato (ikke fra `arbeidPerDag` sin lengde), slik at dager
 * UTEN Holmes-data også vises (som "–"), i stedet for å bare hoppe over dem.
 *
 * Merk: perioder er IKKE nødvendigvis mandag-justert (i motsetning til
 * dagpenger sine 14-dagers meldekortperioder), så det vises ukedag+dato per
 * dag i stedet for en fast Mandag–Søndag-header-rad.
 */
function AapDager({
  periodeFraOgMed,
  periodeTilOgMed,
  arbeidPerDag,
}: AapDagerProps) {
  const dager = useMemo<Dag[]>(() => {
    if (arbeidPerDag.length === 0) {
      return [];
    }

    const timerPerDato = new Map(
      arbeidPerDag.map((d) => [d.dag, d.timerArbeidet]),
    );
    const fra = new Date(periodeFraOgMed);
    // Åpen periode (tilOgMed null): bruk siste dato vi faktisk har
    // Holmes-data for i stedet for å telle helt til i dag.
    const sisteDatoMedData = arbeidPerDag
      .map((d) => d.dag)
      .sort()
      .at(-1);
    const til = periodeTilOgMed
      ? new Date(periodeTilOgMed)
      : sisteDatoMedData
        ? new Date(sisteDatoMedData)
        : fra;

    const resultat: Dag[] = [];
    for (
      let dato = new Date(fra);
      dato <= til;
      dato.setDate(dato.getDate() + 1)
    ) {
      const iso = formaterTilIsoDato(dato);
      resultat.push({ dato: iso, timer: timerPerDato.get(iso) ?? null });
    }
    return resultat;
  }, [periodeFraOgMed, periodeTilOgMed, arbeidPerDag]);

  if (dager.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <Heading level="4" size="xsmall">
        Arbeidet per dag
      </Heading>
      <ul className="flex flex-wrap gap-3" aria-label="Arbeidede timer per dag">
        {dager.map(({ dato, timer }) => {
          const harArbeidet = timer != null && timer > 0;
          const timerTekst =
            timer != null ? `${formaterDesimaltall(timer, 0, 1)} t` : "–";
          const farger = harArbeidet
            ? {
                fill: "var(--ax-success-200)",
                stroke: "var(--ax-success-600)",
              }
            : {
                fill: "var(--ax-neutral-200)",
                stroke: "var(--ax-neutral-600)",
              };

          return (
            <li
              key={dato}
              className="flex flex-col items-center gap-2 list-none"
            >
              <div
                className="relative flex flex-col items-center justify-center rounded-full border-2 text-center px-2 w-16 h-16"
                style={{
                  backgroundColor: farger.fill,
                  borderColor: farger.stroke,
                }}
                aria-label={`${formaterUkedagOgDato(dato)}: ${timer != null ? timerTekst : "ingen data"}`}
              >
                <span className="text-sm leading-tight">{timerTekst}</span>
              </div>
              <span className="text-sm text-ax-text-subtle">
                {formaterUkedagOgDato(dato)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const UKEDAG_FORMAT = new Intl.DateTimeFormat("nb-NO", { weekday: "short" });
const KORT_DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

function formaterUkedagOgDato(isoDato: string): string {
  try {
    const dato = new Date(isoDato);
    const ukedag = UKEDAG_FORMAT.format(dato).replace(/\.$/, "");
    return `${ukedag} ${KORT_DATO_FORMAT.format(dato)}`;
  } catch {
    return isoDato;
  }
}

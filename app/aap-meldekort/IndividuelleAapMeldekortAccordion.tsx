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
} from "~/utils/date-utils";
import { formaterDesimaltall, formaterProsent } from "~/utils/number-utils";

import { useAapMeldekort } from "./AapMeldekortContext";
import type { AapMeldekortRespons } from "./domene";
import { flatterOgFiltrerAapPerioder, type FlatAapPeriode } from "./utils";

type IndividuelleAapMeldekortAccordionProps = {
  fraDato: string;
  tilDato: string;
};

/**
 * Viser en utvidbar liste med individuelle AAP-meldekortperioder (~14 dager,
 * allerede periodisert av backend/Kelvin). I motsetning til
 * `IndividuelleMeldekortAccordion` for dagpenger finnes det ingen daglig
 * aktivitetsvisning her — Kelvin sender ikke dag-for-dag-data, kun
 * periodeaggregater (arbeidetTimer, annenReduksjon, utbetalingsgrad).
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
                  Saksnummer: {aktivPeriode.saksnummer}
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
            <div className="grid grid-cols-1 ax-md:grid-cols-3 gap-4">
              <StatistikkKort
                label="Arbeidet timer"
                verdi={`${formaterDesimaltall(aktivPeriode.arbeidetTimer ?? 0, 0, 1)} t`}
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

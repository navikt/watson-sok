import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Tooltip,
} from "@navikt/ds-react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@navikt/ds-react/Accordion";
import { useEffect, useMemo, useState } from "react";

import { StatistikkKort } from "~/paneler/StatistikkKort";
import { useDisclosure } from "~/use-disclosure/useDisclosure";
import {
  formaterDato,
  formaterMeldekortperiodeMedUke,
  formaterTilIsoDato,
} from "~/utils/date-utils";
import { formaterDesimaltall, formaterProsent } from "~/utils/number-utils";

import { useAapMeldekort } from "./AapMeldekortContext";
import type { AapArbeidPerDag, AapMeldekortRespons } from "./domene";
import {
  flatterOgFiltrerAapPerioder,
  parseDatoLokal,
  type FlatAapPeriode,
} from "./utils";

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
  const { erÅpen: erDatepickerÅpen, onToggle: onToggleDatepicker } =
    useDisclosure(false);

  // Nullstiller ved endring i selve utvalget (vedtak/fraDato/tilDato) — IKKE
  // bare ved lengdeendring. Hvis brukeren bytter til en annen valgt
  // ytelsesperiode som tilfeldigvis har samme ANTALL AAP-perioder, ville en
  // lengde-basert avhengighet latt aktivIndex stå urørt, og visningen kunne
  // åpne på en periode som ikke lenger er den nyeste for det nye utvalget.
  useEffect(() => {
    setAktivIndex(0);
  }, [vedtak, fraDato, tilDato]);

  const aktivPeriode = sortertePerioder[aktivIndex] ?? null;

  if (sortertePerioder.length === 0 || !aktivPeriode) {
    return null;
  }

  const kanGåTilForrige = aktivIndex < sortertePerioder.length - 1;
  const kanGåTilNeste = aktivIndex > 0;

  // Datovelgeren skal kunne velge EN HVILKEN SOM HELST dag som faller
  // innenfor en periodes fra/til-grenser — ikke bare dager som har et
  // konkret arbeidPerDag-datapunkt. arbeidPerDag er en gyldig (og vanlig)
  // tom liste per schema, og en kalender som krever et datapunkt ville da
  // avvise ALLE datoer og bli ubrukelig. Manglende dagsdata vises uansett
  // som "–" inni AapDager, uavhengig av om datoen kunne velges her.
  const datoErIPeriode = (dato: Date, periode: FlatAapPeriode): boolean => {
    const periodeFra = parseDatoLokal(periode.fraOgMed);
    const periodeTil = periode.tilOgMed
      ? parseDatoLokal(periode.tilOgMed)
      : new Date();
    return dato >= periodeFra && dato <= periodeTil;
  };

  const velgRelevantPeriode = (dato: Date | undefined) => {
    if (!dato) {
      return;
    }
    const periode = sortertePerioder.find((p) => datoErIPeriode(dato, p));
    if (periode) {
      setAktivIndex(sortertePerioder.indexOf(periode));
    }
  };

  const eldsteDato = parseDatoLokal(
    sortertePerioder[sortertePerioder.length - 1].fraOgMed,
  );
  // Øvre grense for datovelgeren: bruk siste kjente arbeidPerDag-dato på
  // tvers av alle perioder hvis den finnes (kan strekke seg forbi en åpen
  // periodes fraOgMed), ellers periodens egen tilOgMed/fraOgMed. Uten dette
  // ville en åpen siste periode med daglige data etter periodens fraOgMed
  // (f.eks. periode åpnet 17. aug., men med data til 1. sep.) fått ALLE
  // datoer etter 17. aug. avvist av datovelgeren.
  const nyesteKjenteArbeidPerDagDato = sortertePerioder
    .flatMap((p) => p.arbeidPerDag.map((d) => d.dag))
    .sort()
    .at(-1);
  const nyesteDato = parseDatoLokal(
    sortertePerioder[0].tilOgMed ??
      nyesteKjenteArbeidPerDagDato ??
      sortertePerioder[0].fraOgMed,
  );

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
                <DatePicker
                  open={erDatepickerÅpen}
                  onClose={onToggleDatepicker}
                  onSelect={(dato) => {
                    velgRelevantPeriode(dato);
                    onToggleDatepicker();
                  }}
                  dropdownCaption={true}
                  fromDate={eldsteDato}
                  toDate={nyesteDato}
                  disabled={[{ before: eldsteDato, after: nyesteDato }]}
                >
                  <Button
                    data-color="neutral"
                    aria-label="Velg dato"
                    icon={
                      <Tooltip content="Velg dato">
                        <CalendarIcon aria-hidden="true" />
                      </Tooltip>
                    }
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={onToggleDatepicker}
                  />
                </DatePicker>
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

/** Øvre grense for antall dager som rendres i "Arbeidet per dag"-gridet.
 * De aller fleste AAP-perioder er ~14-16 dager, men enkelte
 * aggregatperioder i testdata (og potensielt i produksjon) kan strekke seg
 * over flere måneder — å rendre én DOM-node per kalenderdag for en slik
 * periode ville laget hundrevis av celler i én accordion. Skjuler
 * dagvisningen (viser kun periodeaggregatene over) i stedet for å risikere
 * en ubegrenset/ytelseskrevende rendering. */
const MAKS_DAGER_I_GRID = 31;

/**
 * Viser arbeidede timer per dag i perioden. Bygger dagrekken selv fra
 * periodens fra/til-dato (ikke fra `arbeidPerDag` sin lengde), slik at dager
 * UTEN Holmes-data også vises (som "–"), i stedet for å bare hoppe over dem.
 *
 * Merk: perioder er IKKE nødvendigvis mandag-justert (i motsetning til
 * dagpenger sine 14-dagers meldekortperioder). For å likevel kunne bruke
 * samme faste Mandag–Søndag-header-rad som dagpenger, fylles gridet ut med
 * tomme celler foran første dag (se `getIsoUkedag`/`antallTommeCellerFør`),
 * slik at hver dag alltid havner i riktig ukedag-kolonne uansett hvilken
 * ukedag perioden faktisk starter på.
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
    const fra = parseDatoLokal(periodeFraOgMed);
    // Åpen periode (tilOgMed null): bruk siste dato vi faktisk har
    // Holmes-data for i stedet for å telle helt til i dag.
    const sisteDatoMedData = arbeidPerDag
      .map((d) => d.dag)
      .sort()
      .at(-1);
    const til = periodeTilOgMed
      ? parseDatoLokal(periodeTilOgMed)
      : sisteDatoMedData
        ? parseDatoLokal(sisteDatoMedData)
        : fra;

    const resultat: Dag[] = [];
    for (
      let dato = new Date(fra);
      dato <= til && resultat.length <= MAKS_DAGER_I_GRID;
      dato.setDate(dato.getDate() + 1)
    ) {
      const iso = formaterTilIsoDato(dato);
      resultat.push({ dato: iso, timer: timerPerDato.get(iso) ?? null });
    }
    return resultat;
  }, [periodeFraOgMed, periodeTilOgMed, arbeidPerDag]);

  // Perioden er for lang til å vises dag-for-dag (se MAKS_DAGER_I_GRID) —
  // vis ingenting her i stedet for en potensielt uendelig/uhåndterlig liste.
  // Periodeaggregatene (Arbeidet timer/Annen reduksjon/Utbetalingsgrad)
  // vises uansett over, uavhengig av dette.
  if (dager.length === 0 || dager.length > MAKS_DAGER_I_GRID) {
    return null;
  }

  // Perioder starter ikke nødvendigvis på mandag (i motsetning til dagpenger
  // sine 14-dagers meldekortperioder), så vi må fylle ut med tomme celler
  // foran første dag for at ukedag-headeren (Mandag–Søndag) skal stemme med
  // riktig kolonne uansett hvilken ukedag perioden starter på.
  const isoUkedagFørsteDag = getIsoUkedag(dager[0].dato);
  const antallTommeCellerFør = isoUkedagFørsteDag - 1;

  return (
    <div className="flex flex-col gap-3">
      <Heading level="4" size="xsmall">
        Arbeidet per dag
      </Heading>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-3 mb-2">
          {UKEDAGER.map((ukedag) => (
            <span
              key={ukedag}
              className="text-lg font-semibold text-center truncate"
            >
              {ukedag}
            </span>
          ))}
        </div>
        <ul
          className="grid grid-cols-7 gap-3"
          aria-label="Arbeidede timer per dag"
        >
          {Array.from({ length: antallTommeCellerFør }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key -- rene fyllceller uten identitet
            <li key={`tom-${index}`} aria-hidden="true" />
          ))}
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
                  role="img"
                  aria-label={`${formaterDato(dato)}: ${timer != null ? timerTekst : "ingen data"}`}
                >
                  {harArbeidet && (
                    <span className="text-sm font-semibold leading-tight">
                      Arbeidet
                    </span>
                  )}
                  <span className="text-sm leading-tight">{timerTekst}</span>
                </div>
                <span className="text-sm text-ax-text-subtle">
                  {formaterKortDato(dato)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const KORT_DATO_FORMAT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

function formaterKortDato(isoDato: string): string {
  try {
    return KORT_DATO_FORMAT.format(parseDatoLokal(isoDato));
  } catch {
    return isoDato;
  }
}

/** ISO-ukedag (mandag = 1 ... søndag = 7) for en "YYYY-MM-DD"-streng. */
function getIsoUkedag(isoDato: string): number {
  const dag = parseDatoLokal(isoDato).getDay();
  return dag === 0 ? 7 : dag;
}

const UKEDAGER = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

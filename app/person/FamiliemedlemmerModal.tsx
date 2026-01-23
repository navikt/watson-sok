import {
  ChildEyesIcon,
  FileSearchIcon,
  PersonIcon,
  PersonTallShortIcon,
} from "@navikt/aksel-icons";
import { BodyShort, Button, Link } from "@navikt/ds-react";
import { Modal, ModalBody, ModalFooter } from "@navikt/ds-react/Modal";
import { useRef, useState } from "react";
import { Form } from "react-router";
import { sporHendelse } from "~/analytics/analytics";
import { useInnloggetBruker } from "~/auth/innlogget-bruker";
import { RouteConfig } from "~/routeConfig";
import {
  formaterFødselsnummer,
  snakeCaseTilSetning,
} from "~/utils/string-utils";
import { beregnAlderFraFødselsEllerDnummer } from "./utils/personident-utils";

type FamiliemedlemmerModalProps = {
  familiemedlemmer: Record<string, string>;
};

/**
 * En modal (med trigger-knapp) som viser en liste over familiemedlemmer
 */
export function FamiliemedlemmerModal({
  familiemedlemmer,
}: FamiliemedlemmerModalProps) {
  const innloggetBruker = useInnloggetBruker();
  const ref = useRef<HTMLDialogElement>(null);
  const familiemedlemmerListe = transformerTilSortertListe(familiemedlemmer);
  const [loadingIdent, setLoadingIdent] = useState<string | null>(null);

  if (familiemedlemmerListe.length === 0) {
    return <BodyShort>Ingen kjente familiemedlemmer</BodyShort>;
  }

  const barn = hentBarn(familiemedlemmerListe);
  const alderStat = beregnBarnAlder(barn);
  const oppsummering = byggOppsummeringstekst(
    familiemedlemmerListe.length,
    barn.length,
    alderStat,
  );

  return (
    <>
      <Link
        as="button"
        onClick={() => ref.current?.showModal()}
        className="text-left p-0"
      >
        {oppsummering}
      </Link>
      <Modal
        ref={ref}
        header={{ heading: "Familiemedlemmer", icon: <PersonTallShortIcon /> }}
        closeOnBackdropClick
      >
        <ModalBody className="min-w-md">
          <div className="flex flex-col gap-2">
            {familiemedlemmerListe.map(({ personIdent, type }) => (
              <div
                className="rounded-md border border-ax-neutral-400 p-2 flex justify-between items-center"
                key={personIdent}
              >
                <div>
                  {mapTypeTilIkon(type)}&nbsp;{snakeCaseTilSetning(type)}:&nbsp;
                  {formaterFødselsnummer(personIdent)}&nbsp;(
                  {beregnAlderFraFødselsEllerDnummer(
                    personIdent,
                    type === "BARN",
                  )}
                  &nbsp; år)
                </div>
                {personIdent && personIdent !== "Ukjent" && (
                  <Form
                    action={RouteConfig.INDEX}
                    method="post"
                    onSubmit={() => {
                      sporHendelse("søk familiemedlem", {
                        // Vi må "lure" proxyen til Umami til å ikke sensurere 
                        // organisasjonsnavnene som personopplysninger ved å lowercase dem
                        organisasjoner: innloggetBruker.organisasjoner.toLowerCase(),
                      });
                      setLoadingIdent(personIdent);
                    }}
                  >
                    <input type="hidden" name="ident" value={personIdent} />
                    <Button
                      variant="tertiary"
                      size="small"
                      type="submit"
                      loading={loadingIdent === personIdent}
                      disabled={loadingIdent === personIdent}
                      icon={
                        <FileSearchIcon
                          aria-hidden={true}
                          className="inline-block"
                          title="Søk etter familiemedlem"
                        />
                      }
                    >
                      Slå opp
                    </Button>
                  </Form>
                )}
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => ref.current?.close()}>
            Lukk
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

/**
 * Mapper familiemedlemtype til ikon
 *
 * @param type - Typen av familiemedlem
 * @returns Ikon-komponent for typen
 *
 * @example
 * mapTypeTilIkon("BARN"); // Returns: <ChildEyesIcon />
 * mapTypeTilIkon("PARTNER"); // Returns: <PersonIcon />
 */
function mapTypeTilIkon(type: string) {
  switch (type) {
    case "BARN":
      return <ChildEyesIcon aria-hidden={true} className="inline-block" />;
    default:
      return <PersonIcon aria-hidden={true} className="inline-block" />;
  }
}

type Familiemedlem = {
  personIdent: string;
  type: string;
};

/**
 * Transformerer familiemedlemmer-record til sortert liste
 *
 * @param familiemedlemmer - Record med personIdent som nøkkel og type som verdi
 * @returns Sortert liste av familiemedlemmer
 *
 * @example
 * const medlemmer = { "12345678901": "BARN", "98765432109": "PARTNER" };
 * const liste = transformerTilSortertListe(medlemmer);
 * // Returns: [{ personIdent: "12345678901", type: "BARN" }, ...]
 */
function transformerTilSortertListe(
  familiemedlemmer: Record<string, string>,
): Familiemedlem[] {
  return Object.entries(familiemedlemmer)
    .map(([personIdent, type]) => ({ personIdent, type }))
    .sort((a, b) => a.type.localeCompare(b.type));
}

/**
 * Henter alle barn fra familiemedlemmer-listen
 *
 * @param familiemedlemmerListe - Liste av familiemedlemmer
 * @returns Liste av familiemedlemmer som er barn
 *
 * @example
 * const medlemmer = [
 *   { personIdent: "123", type: "BARN" },
 *   { personIdent: "456", type: "PARTNER" }
 * ];
 * const barn = hentBarn(medlemmer);
 * // Returns: [{ personIdent: "123", type: "BARN" }]
 */
function hentBarn(familiemedlemmerListe: Familiemedlem[]): Familiemedlem[] {
  return familiemedlemmerListe.filter(({ type }) => type === "BARN");
}

/**
 * Beregner aldersstatistikk for barn
 *
 * @param barn - Liste av familiemedlemmer som er barn
 * @returns Object med yngste og eldste alder, eller null hvis ingen barn
 *
 * @example
 * const barn = [
 *   { personIdent: "01012010", type: "BARN" },
 *   { personIdent: "01012015", type: "BARN" }
 * ];
 * const stat = beregnBarnAlder(barn);
 * // Returns: { yngste: 9, eldste: 14 }
 */
function beregnBarnAlder(barn: Familiemedlem[]): {
  yngste: number;
  eldste: number;
} | null {
  if (barn.length === 0) {
    return null;
  }

  const aldre = barn.map(({ personIdent }) =>
    beregnAlderFraFødselsEllerDnummer(personIdent, true),
  );

  return {
    yngste: Math.min(...aldre),
    eldste: Math.max(...aldre),
  };
}

/**
 * Formaterer aldersoppsummering for barn
 *
 * @param alderStat - Aldersstatistikk for barn
 * @returns Formatert tekststreng med alder, eller tom streng hvis ingen barn
 *
 * @example
 * const stat = { yngste: 10, eldste: 10 };
 * formaterAldersoppsummering(stat); // Returns: "på 10 år"
 *
 * @example
 * const stat = { yngste: 5, eldste: 12 };
 * formaterAldersoppsummering(stat); // Returns: "fra 5 til 12 år"
 */
function formaterAldersoppsummering(
  alderStat: { yngste: number; eldste: number } | null,
): string {
  if (!alderStat) {
    return "";
  }

  if (alderStat.yngste === alderStat.eldste) {
    return `på ${alderStat.yngste} år`;
  }

  return `fra ${alderStat.yngste} til ${alderStat.eldste} år`;
}

/**
 * Bygger oppsummeringstekst for familiemedlemmer
 *
 * @param totalAntall - Totalt antall familiemedlemmer
 * @param antallBarn - Antall barn
 * @param alderStat - Aldersstatistikk for barn
 * @returns Formatert oppsummeringstekst
 *
 * @example
 * const tekst = byggOppsummeringstekst(3, 2, { yngste: 5, eldste: 10 });
 * // Returns: "3 personer, hvorav 2 barn fra 5 til 10 år"
 */
function byggOppsummeringstekst(
  totalAntall: number,
  antallBarn: number,
  alderStat: { yngste: number; eldste: number } | null,
): string {
  const personerTekst = `${totalAntall} ${totalAntall === 1 ? "person" : "personer"}`;
  const aldersoppsummering = formaterAldersoppsummering(alderStat);
  const barnTekst =
    antallBarn > 0 ? `${antallBarn} barn ${aldersoppsummering}` : "ingen barn";

  return `${personerTekst}, hvorav ${barnTekst}`.trim();
}

import { CopyButton, Heading, Link } from "@navikt/ds-react";
import type { PersonInformasjon } from "~/routes/oppslag/[ident]/schemas";
import { formatterAdresse } from "~/utils/adresse-utils";
import { tilFulltNavn } from "~/utils/navn-utils";
import {
  formatterFødselsnummer,
  storFørsteBokstav,
} from "~/utils/string-utils";

type BrukerinformasjonProps = {
  personInformasjon: PersonInformasjon;
};
/**
 * Komponent som viser personlig informasjon om en bruker
 */
export function Brukerinformasjon({
  personInformasjon,
}: BrukerinformasjonProps) {
  const erDNummer = Number(personInformasjon.aktørId?.charAt(0)) > 3;
  const fulltNavn = tilFulltNavn(personInformasjon.navn);
  const folkeregistrertAdresse = formatterAdresse(personInformasjon.adresse);
  const antallFamilemedlemmer = Object.keys(
    personInformasjon.familemedlemmer ?? {},
  ).length;

  return (
    <div className="bg-primary rounded-sm border-1 border-gray-200 p-4 h-fit relative">
      <Heading level="2" size="medium" spacing>
        Brukerinformasjon
      </Heading>
      <div className="md:absolute top-4 right-4 mb-4">
        <Link href="https://modia.nav.no">Historikk</Link>
      </div>
      <dl className="grid sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-4 gap-y-2 [&>dt]:font-bold [&>dd]:flex [&>dd]:items-center [&>dd]:min-h-7">
        <dt>Navn</dt>
        <dd>
          {tilFulltNavn(personInformasjon.navn)}{" "}
          <KopiKnapp copyText={fulltNavn} />
        </dd>
        {personInformasjon.aktørId && (
          <>
            <dt>{erDNummer ? "D-nummer" : "Fødselsnummer"}</dt>
            <dd>
              {formatterFødselsnummer(personInformasjon.aktørId)}&nbsp;
              <KopiKnapp copyText={personInformasjon.aktørId} />
            </dd>
          </>
        )}
        {folkeregistrertAdresse && (
          <>
            <dt>Folkeregistrert adresse</dt>
            <dd>
              {folkeregistrertAdresse}&nbsp;
              <KopiKnapp copyText={folkeregistrertAdresse} />
            </dd>
          </>
        )}
        <dt>Statsborgerskap</dt>
        <dd>{personInformasjon.statsborgerskap.join(", ")}</dd>
        <dt>Sivilstand</dt>
        <dd>{storFørsteBokstav(personInformasjon.sivilstand ?? "Ukjent")}</dd>
        <dt>Familemedlemmer</dt>
        <dd>
          {antallFamilemedlemmer}{" "}
          {antallFamilemedlemmer === 1 ? "familiemedlem" : "familemedlemmer"}
        </dd>
      </dl>
    </div>
  );
}

type KopiKnappProps = {
  copyText: string;
};
const KopiKnapp = ({ copyText }: KopiKnappProps) => {
  return (
    <CopyButton
      copyText={copyText}
      size="xsmall"
      className="inline-block ml-1"
    />
  );
};

import { BodyLong, Heading, Link, List, Page } from "@navikt/ds-react";
import { ListItem } from "@navikt/ds-react/List";

export default function Personvern() {
  return (
    <Page.Block width="text" gutters>
      <Heading level="1" size="large" spacing className="mt-4">
        Personvern
      </Heading>
      <BodyLong size="large" spacing>
        Når du bruker tjenesten, lagrer vi informasjon om hva du foretar deg.
        Her kan du lese mer om hva som registreres, og hvordan vi bruker
        informasjonen.
      </BodyLong>
      <Heading level="2" size="medium" spacing>
        Hva samler vi inn?
      </Heading>
      <BodyLong spacing>
        Alle søk du gjør på tjenesten blir lagret i en audit-logg. Dette gjøres
        for å sikre sporbarhet av alle oppslag som gjøres i tjenesten, og for å
        kunne vise tjenestlig behov for oppslag.
      </BodyLong>
      <BodyLong spacing>
        I tillegg til å journalføre alle søk, lagrer vi også informasjon om
        hvordan du bruker tjenesten. Dette gjøres for å kvantitativt analysere
        bruk av tjenesten, slik at vi kan videreutvikle og forbedre den.
        Eksempler på hva vi samler inn er:
      </BodyLong>
      <List className="mb-4">
        <ListItem>Hvor i løsningen du slår opp personer fra</ListItem>
        <ListItem>Om du trykker på hjelpetekster</ListItem>
        <ListItem>Hvilke lenker i løsningen du trykker på</ListItem>
        <ListItem>Hvilke sider du er inne på</ListItem>
      </List>

      <BodyLong spacing>
        Om du ikke ønsker at vi samler inn denne bruksinformasjonen, kan du slå
        på innstillingen &quot;Ikke spor meg&quot; i nettleseren din.
      </BodyLong>
      <Heading level="2" size="medium" spacing>
        Spørsmål?
      </Heading>
      <BodyLong spacing>
        Har du spørsmål om personvern eller om hvordan vi bruker informasjonen
        vi samler inn, kan du kontakte teamet på{" "}
        <Link href="mailto:espen.einn@nav.no">espen.einn@nav.no</Link>.
      </BodyLong>
    </Page.Block>
  );
}

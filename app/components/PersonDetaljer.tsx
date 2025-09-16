import { FilesIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  Box,
  CopyButton,
  ExpansionCard,
  Heading,
  HStack,
  Link,
} from "@navikt/ds-react";
import type { PersonInformasjon } from "~/routes/oppslag/[ident]/schemas";

export default function PersonDetaljer({
  personInformasjon,
}: {
  personInformasjon: PersonInformasjon;
}) {
  return (
    <div className="p-6">
      <Box padding="space-16" borderRadius="large" shadow="xsmall">
        <Heading level="2" size="medium" spacing>
          Brukerinformasjon
        </Heading>

        <HStack gap="2">
          <BodyLong>
            {personInformasjon.navn.fornavn}{" "}
            {personInformasjon.navn.mellomnavn &&
              `${personInformasjon.navn.mellomnavn} `}
            {personInformasjon.navn.etternavn}
          </BodyLong>
          <Link href="/personHistorikk">Navnehistorikk</Link>
        </HStack>
        <HStack gap="2">
          <BodyLong>
            {Array.isArray(personInformasjon.statsborgerskap)
              ? personInformasjon.statsborgerskap
                  .map((s) => (s ?? "").trim())
                  .filter((s) => s.length > 0)
                  .join(", ")
              : "–"}
          </BodyLong>
        </HStack>
        {personInformasjon.aktørId && (
          <HStack gap="0" align="center">
            <BodyLong as="span">{personInformasjon.aktørId}</BodyLong>
            <CopyButton
              size="small"
              copyText={personInformasjon.aktørId}
              icon={
                <FilesIcon aria-hidden style={{ verticalAlign: "middle" }} />
              }
              activeIcon={
                <FilesIcon aria-hidden style={{ verticalAlign: "middle" }} />
              }
            />
            <Link href="/personHistorikk">Fødselsnummerhistorikk</Link>
          </HStack>
        )}

        <HStack gap="2">
          <BodyLong>
            {personInformasjon.adresse?.norskAdresse?.adressenavn}{" "}
            {personInformasjon.adresse?.norskAdresse?.husnummer}{" "}
            {personInformasjon.adresse?.norskAdresse?.husbokstav}
            {", "}
            {personInformasjon.adresse?.norskAdresse?.postnummer}{" "}
            {personInformasjon.adresse?.norskAdresse?.poststed}
          </BodyLong>
          <Link href="/personHistorikk">Adressehistorikk</Link>
        </HStack>
        <HStack gap="2">
          <BodyLong>
            {Object.keys(personInformasjon.familemedlemmer ?? {}).length}
          </BodyLong>
          <BodyLong>familiemedlemmer</BodyLong>
          <Link href="/personHistorikk">Famileforhold</Link>
        </HStack>
        <ExpansionCard aria-label="Data">
          <ExpansionCard.Header>
            <ExpansionCard.Title>Data</ExpansionCard.Title>
          </ExpansionCard.Header>
          <ExpansionCard.Content>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(personInformasjon, null, 2)}
            </pre>
          </ExpansionCard.Content>
        </ExpansionCard>
      </Box>
    </div>
  );
}

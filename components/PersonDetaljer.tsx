"use client";

import { PersonInformasjon } from "@/types/Domain";
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
          <BodyLong>{personInformasjon.navn}</BodyLong>
          <Link href="/personHistorikk">Navnehistorikk</Link>
        </HStack>
        <HStack gap="2">
          <BodyLong>
            {Array.isArray(personInformasjon.statsborgerskap)
              ? personInformasjon.statsborgerskap
                  .map((s) => (s ?? "").trim())
                  .filter((s) => s.length > 0)
                  .join(", ")
              : (personInformasjon.navn ?? "–")}
          </BodyLong>
        </HStack>
        <HStack gap="0" align="center">
          <BodyLong as="span">{personInformasjon.aktorId}</BodyLong>
          <CopyButton
            size="small"
            copyText={personInformasjon.aktorId}
            icon={<FilesIcon aria-hidden style={{ verticalAlign: "middle" }} />}
            activeIcon={
              <FilesIcon aria-hidden style={{ verticalAlign: "middle" }} />
            }
          />
          <Link href="/personHistorikk">Fødselsnummerhistorikk</Link>
        </HStack>

        <HStack gap="2">
          <BodyLong>{personInformasjon.adresse}</BodyLong>
          <Link href="/personHistorikk">Adresseßhistorikk</Link>
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

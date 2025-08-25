"use client";



import {PersonInformasjon} from "@/app/types/Domain";
import {BodyLong, Box, ExpansionCard, Heading, HStack, Link} from "@navikt/ds-react";

export default function PersonDetaljer({
                                            personInformasjon,
                                        }: {
    personInformasjon: PersonInformasjon;
}) {

    return (

        <div className="p-6">
            <Box
                padding="space-16"
                borderRadius="large"
                shadow="xsmall"
            >
                <Heading level="2" size="medium" spacing>
                    Brukerinformasjon
                </Heading>

                <HStack gap="2">
                    <BodyLong>
                        {personInformasjon.navn}
                    </BodyLong>
                    <Link href="/personHistorikk">Navnehistorikk</Link>
                </HStack>
                <HStack gap="2">
                    <BodyLong>
                        {personInformasjon.aktorId}
                    </BodyLong>
                    <Link href="/personHistorikk">Fødselsnummerhistorikk</Link>
                </HStack>
                <HStack gap="2">
                    <BodyLong>
                        {personInformasjon.adresse}
                    </BodyLong>
                    <Link href="/personHistorikk">Adresseßhistorikk</Link>
                </HStack>
                <HStack gap="2">
                    <BodyLong>
                        {Object.keys(personInformasjon.familemedlemmer ?? {}).length}
                    </BodyLong>
                    <BodyLong>
                        familiemedlemmer
                    </BodyLong>
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

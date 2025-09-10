"use client";


import styles from "./page.module.css";
import {PersonInformasjon} from "@/app/types/Domain";
import {BodyLong, Box, CopyButton, ExpansionCard, Heading, HStack} from "@navikt/ds-react";
import {FilesIcon} from "@navikt/aksel-icons";

export default function PersonDetaljer({
                                            personInformasjon,
                                        }: {
    personInformasjon: PersonInformasjon;
}) {

    const fulltnavn = [
        personInformasjon.navn_?.fornavn,
        personInformasjon.navn_?.mellomnavn,
        personInformasjon.navn_?.etternavn
    ]
        .filter(Boolean) // fjerner null, undefined, ""
        .join(" ");

        const adresse =  [personInformasjon.adresse_?.norskAdresse?.adressenavn,
                                personInformasjon.adresse_?.norskAdresse?.husnummer,
                                personInformasjon.adresse_?.norskAdresse?.husbokstav,
                                ",",
                                personInformasjon.adresse_?.norskAdresse?.postnummer]
            .filter(Boolean) // fjerner null, undefined, ""
            .join(" ");

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
                <dl className={styles.keyValueLayout}>
                    <dt>Navn</dt>
                    <dd>
                        <HStack gap="0" align="center">

                            <BodyLong as="span">{fulltnavn}</BodyLong>
                            <CopyButton size="small"
                                        copyText={fulltnavn}
                                        icon={<FilesIcon aria-hidden style={{verticalAlign: "middle"}}/>}
                                        activeIcon={<FilesIcon aria-hidden style={{verticalAlign: "middle"}}/>}
                            />
                        </HStack>
                    </dd>
                    <dt>Fødselsnummer eller Dnr :</dt>
                    <dd>
                        <HStack gap="0" align="center">

                            <BodyLong as="span">{personInformasjon.aktorId}</BodyLong>
                            <CopyButton size="small"
                                        copyText={personInformasjon.aktorId}
                                        icon={<FilesIcon aria-hidden style={{verticalAlign: "middle"}}/>}
                                        activeIcon={<FilesIcon aria-hidden style={{verticalAlign: "middle"}}/>}
                            />
                        </HStack>
                    </dd>

                    <dt>Folkeregistrert adresse</dt>
                    <dd>
                        <HStack gap="0" align="center">
                            <BodyLong as="span">
                        {personInformasjon.adresse_
                            ? (
                                <>
                                    {[
                                        personInformasjon.adresse_?.norskAdresse?.adressenavn,
                                        personInformasjon.adresse_?.norskAdresse?.husnummer,
                                        personInformasjon.adresse_?.norskAdresse?.husbokstav
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    <br />
                                    {[
                                        personInformasjon.adresse_?.norskAdresse?.postnummer,
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}, NORGE
                                </>
                            )
                            : "–"}
                            </BodyLong>
                            <CopyButton size="small"
                                        copyText={adresse}
                                        icon={<FilesIcon aria-hidden style={{verticalAlign: "middle"}}/>}
                                        activeIcon={<FilesIcon aria-hidden style={{verticalAlign: "middle"}}/>}
                            />
                        </HStack>
                    </dd>
                    <dt>statsborgerskap</dt>
                    <dd> <BodyLong>
                        {Array.isArray(personInformasjon.statsborgerskap)
                            ? personInformasjon.statsborgerskap
                                .map((s) => (s ?? "").trim())
                                .filter((s) => s.length > 0)
                                .join(", ")
                            : (personInformasjon.navn ?? "–")}
                    </BodyLong></dd>
                    <dt>sivilstatus</dt>
                    <dd>{personInformasjon.sivilstand}</dd>
                    <dt>familiemedlemmer</dt>
                    <dd> <BodyLong>
                        {Object.keys(personInformasjon.familemedlemmer ?? {}).length}
                    </BodyLong></dd>
                </dl>
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

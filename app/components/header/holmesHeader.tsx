'use client'
import { PersonIcon, PersonGroupIcon, MenuGridIcon,Buildings3Icon,BarChartIcon,ExternalLinkIcon } from "@navikt/aksel-icons";
import { ActionMenu, InternalHeader, Spacer } from "@navikt/ds-react";
import { useFeature } from "../../context/FeatureContext"; // tilpass sti


export default function HolmesHeader() {
    const { setValgtFeature } = useFeature();
    return (
        <InternalHeader>
            <InternalHeader.Title as="h1">Oppslag bruker 1.0</InternalHeader.Title>

            <Spacer />
            <ActionMenu>
                <ActionMenu.Trigger>
                    <InternalHeader.Button>
                        <MenuGridIcon
                            fontSize="1.5rem"
                            title="Systemer og oppslagsverk"
                        />
                    </InternalHeader.Button>
                </ActionMenu.Trigger>
                <ActionMenu.Content>
                    <ActionMenu.Group label="Interne flater">
                        <ActionMenu.Item onSelect={() => setValgtFeature("oppslag-bruker")} icon={<PersonIcon />}>
                            Oppslag bruker
                        </ActionMenu.Item>
                        <ActionMenu.Item onSelect={() => setValgtFeature("arbeidsgiveroversikt")} icon={<PersonGroupIcon />}>
                            Arbeidsgiveroversikt
                        </ActionMenu.Item>

                        <ActionMenu.Item
                            onSelect={console.info}
                            disabled
                            icon={<BarChartIcon />}
                        >
                            statestikk og innsikt
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                    <ActionMenu.Divider />
                    <ActionMenu.Group label="Systemer og oppslagsverk">
                        <ActionMenu.Item onSelect={console.info}  icon={<ExternalLinkIcon />}>
                            Gosys
                        </ActionMenu.Item>
                        <ActionMenu.Item onSelect={console.info} icon={<ExternalLinkIcon />}>Modia</ActionMenu.Item>
                        <ActionMenu.Item onSelect={console.info} icon={<Buildings3Icon />}>
                            Argus
                        </ActionMenu.Item>
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
            <InternalHeader.User name="Saksbehandler Kari" />
        </InternalHeader>
    )
}
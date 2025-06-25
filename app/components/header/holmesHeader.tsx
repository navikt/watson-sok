'use client'
import { PersonIcon, PersonGroupIcon, MenuGridIcon,Buildings3Icon,BarChartIcon,ExternalLinkIcon } from "@navikt/aksel-icons";
import { ActionMenu, Search, InternalHeader, Spacer } from "@navikt/ds-react";


export default function HolmesHeader() {
    return (
        <InternalHeader>
            <InternalHeader.Title as="h1">Holmes</InternalHeader.Title>
            <form
                className="self-center px-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    console.info("Search!");
                }}
            >
                <Search
                    label="InternalHeader søk"
                    size="medium"
                    variant="simple"
                    placeholder="fnr/dnr"
                />
            </form>
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
                        <ActionMenu.Item onSelect={console.info} icon={<PersonIcon />}>
                            Oppslag bruker
                        </ActionMenu.Item>
                        <ActionMenu.Item
                            onSelect={console.info}
                            icon={<PersonGroupIcon />}
                        >
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
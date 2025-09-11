"use client";

import {
  BarChartIcon,
  Buildings3Icon,
  ExternalLinkIcon,
  MenuGridIcon,
  PersonGroupIcon,
  PersonIcon,
} from "@navikt/aksel-icons";
import { ActionMenu, InternalHeader, Spacer } from "@navikt/ds-react";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function HolmesHeader() {
  const router = useRouter();
  const user = useUser();

  return (
    <InternalHeader>
      <InternalHeader.Title as="h1">Oppslag bruker 1.0</InternalHeader.Title>
      <Spacer />
      <ActionMenu>
        <ActionMenu.Trigger>
          <InternalHeader.Button>
            <MenuGridIcon fontSize="1.5rem" title="Systemer og oppslagsverk" />
          </InternalHeader.Button>
        </ActionMenu.Trigger>

        <ActionMenu.Content>
          <ActionMenu.Group label="Interne flater">
            <ActionMenu.Item
              onSelect={() => router.push("/")}
              icon={<PersonIcon />}
            >
              Oppslag bruker
            </ActionMenu.Item>
            <ActionMenu.Item
              onSelect={() => router.push("/arbeidsgivere")}
              icon={<PersonGroupIcon />}
            >
              Arbeidsgiveroversikt
            </ActionMenu.Item>
            <ActionMenu.Item
              onSelect={() => router.push("/statistikk")}
              icon={<BarChartIcon />}
            >
              Statistikk og innsikt
            </ActionMenu.Item>
          </ActionMenu.Group>

          <ActionMenu.Divider />

          <ActionMenu.Group label="Systemer og oppslagsverk">
            <ActionMenu.Item
              onSelect={console.info}
              icon={<ExternalLinkIcon />}
            >
              Gosys
            </ActionMenu.Item>
            <ActionMenu.Item
              onSelect={console.info}
              icon={<ExternalLinkIcon />}
            >
              Modia
            </ActionMenu.Item>
            <ActionMenu.Item onSelect={console.info} icon={<Buildings3Icon />}>
              Argus
            </ActionMenu.Item>
          </ActionMenu.Group>
        </ActionMenu.Content>
      </ActionMenu>

      <InternalHeader.User name={user?.name ?? "Saksbehandler"} />
    </InternalHeader>
  );
}

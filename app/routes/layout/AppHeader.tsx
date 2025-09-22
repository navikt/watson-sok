import {
  BarChartIcon,
  Buildings3Icon,
  ExternalLinkIcon,
  MenuGridIcon,
  MoonIcon,
  PersonGroupIcon,
  PersonIcon,
  SunIcon,
} from "@navikt/aksel-icons";
import { ActionMenu, InternalHeader, Spacer } from "@navikt/ds-react";
import { Link, useNavigate } from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { useUser } from "~/features/auth/useUser";
import { useTheme } from "~/features/darkside/ThemeContext";

export function AppHeader() {
  const user = useUser();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  return (
    <InternalHeader>
      <InternalHeader.Title as="h1">
        <Link to={RouteConfig.INDEX} className="">
          Oppslag bruker 1.0
        </Link>
      </InternalHeader.Title>
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
              onSelect={() => navigate(RouteConfig.INDEX)}
              icon={<PersonIcon />}
            >
              Oppslag bruker
            </ActionMenu.Item>
            <ActionMenu.Item disabled icon={<PersonGroupIcon />}>
              Arbeidsgiveroversikt
            </ActionMenu.Item>
            <ActionMenu.Item disabled icon={<BarChartIcon />}>
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

          <ActionMenu.Divider />

          <ActionMenu.Item
            onSelect={toggleTheme}
            icon={theme === "light" ? <MoonIcon /> : <SunIcon />}
          >
            Bruk {theme === "light" ? "mørke" : "lyse"} farger
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>

      <InternalHeader.User name={user?.name ?? "Saksbehandler"} />
    </InternalHeader>
  );
}

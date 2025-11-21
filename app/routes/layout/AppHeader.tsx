import {
  BooksIcon,
  MenuGridIcon,
  MoonIcon,
  PersonIcon,
  SunIcon,
} from "@navikt/aksel-icons";
import {
  ActionMenu,
  InternalHeader,
  Search,
  Spacer,
  Tag,
} from "@navikt/ds-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link, useFetcher, useNavigate } from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { useUser } from "~/features/auth/useUser";
import { useTheme } from "~/features/darkside/ThemeContext";
import { useMiljø } from "~/features/use-miljø/useMiljø";
import { sporHendelse } from "~/utils/analytics";

export function AppHeader() {
  const user = useUser();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const fetcher = useFetcher();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [metaKey, setMetaKey] = useState<"⌘" | "ctrl">("ctrl");

  useHotkeys("mod+k", (event) => {
    event.preventDefault();
    searchInputRef.current?.focus();
  });

  useEffect(() => {
    if (navigator.userAgent.includes("Macintosh")) {
      setMetaKey("⌘");
    } else {
      setMetaKey("ctrl");
    }
  }, []);

  const miljø = useMiljø();
  const visMiljøtag = miljø !== "prod";
  const miljøtagVariant =
    miljø === "demo" ? "alt2" : miljø === "dev" ? "alt1" : "alt3";

  return (
    <InternalHeader>
      <InternalHeader.Title as="h1">
        <div className="flex items-center gap-2">
          <Link to={RouteConfig.INDEX}>Oppslag bruker</Link>
          {visMiljøtag && (
            <Tag variant={miljøtagVariant} size="small">
              {miljø}
            </Tag>
          )}
        </div>
      </InternalHeader.Title>

      <fetcher.Form
        role="search"
        method="post"
        action={RouteConfig.INDEX}
        className="items-center hidden md:flex ml-5"
        onSubmit={() => sporHendelse("søk header")}
      >
        <Search
          ref={searchInputRef}
          name="ident"
          size="small"
          placeholder={`Søk på bruker (${metaKey}+k)`}
          label="Fødselsnummer eller D-nummer på bruker"
          autoComplete="off"
          htmlSize={20}
          variant="secondary"
        >
          <Search.Button type="submit" loading={fetcher.state !== "idle"} />
        </Search>
      </fetcher.Form>
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
          </ActionMenu.Group>

          <ActionMenu.Divider />
          <ActionMenu.Item
            as="a"
            href="https://navno.sharepoint.com/sites/45/SitePages/Holmes.aspx"
            target="_blank"
            rel="noopener noreferrer"
            icon={<BooksIcon />}
          >
            Hjelp
          </ActionMenu.Item>

          <ActionMenu.Item
            onSelect={() => {
              toggleTheme();
              sporHendelse(
                `endre tema til ${theme === "light" ? "mørk" : "lys"}`,
              );
            }}
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

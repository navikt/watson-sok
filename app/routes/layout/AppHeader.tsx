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
import { Form, Link, useNavigate, useNavigation } from "react-router";
import { RouteConfig } from "~/config/routeConfig";
import { useUser } from "~/features/auth/useUser";
import { useTheme } from "~/features/darkside/ThemeContext";
import { useMiljø } from "~/features/use-miljø/useMiljø";
import { sporHendelse } from "~/utils/analytics";

export function AppHeader() {
  const user = useUser();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [metaKey, setMetaKey] = useState<"⌘" | "ctrl">("ctrl");
  const [isLoading, setIsLoading] = useState(false);

  useHotkeys("mod+k", (event) => {
    event.preventDefault();
    event.stopPropagation();
    searchInputRef.current?.focus();
  });

  useEffect(() => {
    if (navigator.userAgent.includes("Macintosh")) {
      setMetaKey("⌘");
    } else {
      setMetaKey("ctrl");
    }
  }, []);

  useEffect(() => {
    if (navigation.state === "idle") {
      setIsLoading(false);
    }
  }, [navigation.state]);

  const miljø = useMiljø();
  const visMiljøtag = miljø !== "prod";
  const miljøtagVariant =
    miljø === "demo" ? "alt2" : miljø === "dev" ? "alt1" : "alt3";

  return (
    <InternalHeader>
      <InternalHeader.Title as="h1">
        <div className="flex items-center gap-2">
          <Link to={RouteConfig.INDEX}>Watson Søk</Link>
          {visMiljøtag && (
            <Tag variant={miljøtagVariant} size="small">
              {miljø}
            </Tag>
          )}
        </div>
      </InternalHeader.Title>

      <Form
        method="post"
        role="search"
        action={RouteConfig.INDEX}
        className="items-center hidden md:flex ml-5"
        onSubmit={() => {
          sporHendelse("søk header");
          setIsLoading(true);
        }}
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
          disabled={isLoading}
        >
          <Search.Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          />
        </Search>
      </Form>
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
              Watson Søk
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
              sporHendelse("endre tema", {
                tema: theme === "light" ? "mørk" : "lys",
              });
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

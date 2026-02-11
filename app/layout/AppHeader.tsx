import {
  BooksIcon,
  InformationSquareIcon,
  LightBulbIcon,
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
import { sporHendelse } from "~/analytics/analytics";
import { useInnloggetBruker } from "~/auth/innlogget-bruker";
import { useMiljø } from "~/miljø/useMiljø";
import { usePreferanser } from "~/preferanser/PreferanserContext";
import { RouteConfig } from "~/routeConfig";
import { SnarveierHjelpModal } from "~/snarveier/SnarveierHjelp";
import { hentSnarveierGruppert } from "~/snarveier/snarveier";

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

export function AppHeader() {
  const innloggetBruker = useInnloggetBruker();
  const navigate = useNavigate();
  const { theme, toggleTheme } = usePreferanser();
  const navigation = useNavigation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const snarveierModalRef = useRef<HTMLDialogElement>(null);
  const snarveierGruppert = hentSnarveierGruppert();
  const [isLoading, setIsLoading] = useState(false);

  useHotkeys("mod+k, alt+k", (event) => {
    event.preventDefault();
    event.stopPropagation();
    searchInputRef.current?.focus();
  });

  // Vis snarveier-hjelp (?) — bruker keydown med event.key for å fungere på alle tastaturlayouter
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "?") return;
      const target = e.target as HTMLElement | null;
      if (target && INPUT_TAGS.has(target.tagName)) return;

      e.preventDefault();
      sporHendelse("hotkey brukt", { hotkey: "?" });
      snarveierModalRef.current?.showModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
        className="items-center hidden ax-md:flex ml-5"
        onSubmit={() => {
          sporHendelse("søk header", {
            organisasjoner: innloggetBruker.organisasjoner,
          });
          setIsLoading(true);
        }}
      >
        <Search
          ref={searchInputRef}
          name="ident"
          size="small"
          placeholder={`Søk på bruker (alt + k)`}
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
            as="a"
            href="https://watson-sok.ideas.aha.io"
            target="_blank"
            rel="noopener noreferrer"
            icon={<LightBulbIcon />}
          >
            Idéportal
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

          <ActionMenu.Divider />
          <ActionMenu.Item
            onSelect={() => snarveierModalRef.current?.showModal()}
            icon={<InformationSquareIcon />}
          >
            Tastatursnarveier
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>

      <InternalHeader.User name={innloggetBruker?.name ?? "Saksbehandler"} />
      <SnarveierHjelpModal
        ref={snarveierModalRef}
        gruppert={snarveierGruppert}
      />
    </InternalHeader>
  );
}

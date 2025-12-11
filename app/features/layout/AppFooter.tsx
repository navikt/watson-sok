import { BodyLong, Detail, Link as NavLink, Theme } from "@navikt/ds-react";
import { Link, unstable_useRoute } from "react-router";
import { RouteConfig } from "~/config/routeConfig";

export function AppFooter() {
  const loaderData = unstable_useRoute("root");
  const appversjon = formaterVersjon(loaderData?.loaderData?.envs.appversjon);
  return (
    <div className="mt-8">
      <Theme theme="dark">
        <footer className="p-4">
          <BodyLong align="center">
            <NavLink as={Link} to={RouteConfig.PERSONVERN}>
              Personvern
            </NavLink>
          </BodyLong>
          <Detail align="center" className="mt-2 text-text-subtle">
            Versjon: {appversjon}
          </Detail>
        </footer>
      </Theme>
    </div>
  );
}

function formaterVersjon(versjon?: string) {
  if (!versjon) {
    return "ukjent";
  }
  const erHash = /^[0-9a-f]{7,}/i.test(versjon);
  if (erHash) {
    return versjon.slice(0, 7);
  }
  return versjon;
}

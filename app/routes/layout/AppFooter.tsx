import { BodyLong, Link as NavLink, Theme } from "@navikt/ds-react";
import { Link } from "react-router";
import { RouteConfig } from "~/config/routeConfig";

export function AppFooter() {
  return (
    <div className="mt-8">
      <Theme theme="dark">
        <footer className="p-4">
          <BodyLong align="center">
            <NavLink as={Link} to={RouteConfig.PERSONVERN}>
              Personvern
            </NavLink>
          </BodyLong>
        </footer>
      </Theme>
    </div>
  );
}

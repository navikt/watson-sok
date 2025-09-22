import { BodyLong, Box, Link as NavLink } from "@navikt/ds-react";
import { Link } from "react-router";
import { RouteConfig } from "~/config/routeConfig";

export function AppFooter() {
  return (
    <Box background="surface-inverted" padding="4" as="footer">
      <BodyLong align="center">
        <NavLink
          as={Link}
          to={RouteConfig.PERSONVERN}
          style={{ color: "var(--a-text-on-inverted)" }}
        >
          Personvern
        </NavLink>
      </BodyLong>
    </Box>
  );
}

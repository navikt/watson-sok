import { BodyLong, Box } from "@navikt/ds-react";
import { Link } from "react-router";
import { RouteConfig } from "~/config/routeConfig";

export function AppFooter() {
  return (
    <Box background="surface-subtle" padding="4" as="footer">
      <BodyLong align="center">
        <Link to={RouteConfig.PERSONVERN}>Personvern</Link>
      </BodyLong>
    </Box>
  );
}

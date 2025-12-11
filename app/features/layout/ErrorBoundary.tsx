import { isRouteErrorResponse } from "react-router";
import type { Route } from "../../+types/root";
import { InternalServerError } from "../feilhåndtering/InternalServerError";
import { PageNotFound } from "../feilhåndtering/PageNotFound";
import { logger } from "../logging/logging";
import { HtmlRamme } from "./HtmlRamme";

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  logger.error("Feil fanget av error boundary", { error });
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <HtmlRamme umamiSiteId="">
        <PageNotFound />
      </HtmlRamme>
    );
  }
  return (
    <HtmlRamme umamiSiteId="">
      <InternalServerError />
    </HtmlRamme>
  );
}

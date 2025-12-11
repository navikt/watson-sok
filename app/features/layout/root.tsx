import { Outlet, useLoaderData } from "react-router";
import { useFaro } from "~/features/monitorering/faro";
import { Versjonsvarsling } from "~/features/versjonsvarsling/Versjonsvarsling";
import "~/globals.css";
import { HtmlRamme } from "./HtmlRamme";
import type { loader } from "./loader.server";

export default function Root() {
  const { envs, initialTheme } = useLoaderData<typeof loader>();
  useFaro();
  return (
    <HtmlRamme initialTheme={initialTheme} umamiSiteId={envs.umamiSiteId}>
      <Versjonsvarsling gjeldendeVersjon={envs.appversjon} />
      <Outlet />
    </HtmlRamme>
  );
}

export { genererSikkerhetsheaders as headers } from "~/features/sikkerhet/headers.server";
export { ErrorBoundary } from "./ErrorBoundary";
export { loader } from "./loader.server";

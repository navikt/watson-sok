/**
 * Dette er entry-pointet til appen. Ta en titt på features/layout/root.tsx for mer informasjon.
 */

import { rootLoader } from "~/layout/loader.server";
import { default as RootRoute } from "~/layout/root";

export default RootRoute;
export { ErrorBoundary } from "~/layout/ErrorBoundary";
export { headers } from "~/sikkerhet/headers";
export const loader = rootLoader;

/**
 * Dette er entry-pointet til appen. Ta en titt på features/layout/root.tsx for mer informasjon.
 */

import { default as RootRoute } from "~/layout/root";

export default RootRoute;
export { ErrorBoundary } from "~/layout/ErrorBoundary";
export { rootLoader as loader } from "~/layout/loader.server";
export { headers } from "~/sikkerhet/headers";

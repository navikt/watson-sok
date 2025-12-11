/**
 * Dette er entry-pointet til appen. Ta en titt på features/layout/root.tsx for mer informasjon.
 */

import { default as RootRoute } from "~/features/layout/root";

export default RootRoute;
export { ErrorBoundary } from "~/features/layout/ErrorBoundary";
export { loader } from "~/features/layout/loader.server";
export { headers } from "~/features/sikkerhet/headers";

/**
 * Dette er entry-pointet til appen. Ta en titt på features/layout/root.tsx for mer informasjon.
 */

import {
  ErrorBoundary,
  default as RootRoute,
  headers,
  loader,
} from "~/features/layout/root";

export default RootRoute;
export { ErrorBoundary, headers, loader };

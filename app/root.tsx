import {
  isRouteErrorResponse,
  Links,
  type LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "~/globals.css";
import { getLoggedInUser } from "~/utils/access-token";
import type { Route } from "./+types/root";

export default function Root() {
  return (
    <html lang="nb-no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getLoggedInUser({ request });
  return { user };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.log(error);
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <div>404</div>;
  }
  return <div>Error</div>;
}

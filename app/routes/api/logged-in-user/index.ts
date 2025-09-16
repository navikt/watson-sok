import type { LoaderFunctionArgs } from "react-router";
import { getLoggedInUser } from "~/utils/access-token";

export async function loader({ request }: LoaderFunctionArgs) {
  return getLoggedInUser({ request });
}

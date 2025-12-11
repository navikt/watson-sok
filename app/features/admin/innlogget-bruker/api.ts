import type { LoaderFunctionArgs } from "react-router";
import { getLoggedInUser } from "~/features/auth/access-token";

const brukereSomHarTilgang = {
  hansJacob: "M118976",
  kristofer: "S162301",
  snorri: "E176931",
  sturle: "H139079",
  espen: "E170973",
  // Testbruker vi bruker i dev
  devTestbruker: "Z994531",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedInUser = await getLoggedInUser({ request });
  if (Object.values(brukereSomHarTilgang).includes(loggedInUser.navIdent)) {
    return loggedInUser;
  }
  return Response.json({ error: "Du har ikke tilgang" }, { status: 403 });
}

import { data } from "react-router";

import { PageNotFound } from "~/feilhåndtering/PageNotFound";

export const loader = () => {
  return data({}, { status: 404 });
};

export default function NotFoundRoute() {
  return <PageNotFound />;
}

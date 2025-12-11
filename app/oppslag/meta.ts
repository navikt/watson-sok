import type { MetaArgs } from "react-router";
import type { loader } from "./loader.server";

export function meta({ loaderData }: MetaArgs<typeof loader>) {
  const miljø = loaderData?.miljø ?? "ukjent";
  return [
    {
      title: `Oppslag – Watson Søk ${miljø !== "prod" ? `(${miljø})` : ""}`,
    },
  ];
}

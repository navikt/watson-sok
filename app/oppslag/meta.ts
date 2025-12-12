import type { MetaArgs } from "react-router";
import type { oppslagLoader } from "./loader.server";

export function meta({ loaderData }: MetaArgs<typeof oppslagLoader>) {
  const miljø = loaderData?.miljø ?? "ukjent";
  return [
    {
      title: `Oppslag – Watson Søk ${miljø !== "prod" ? `(${miljø})` : ""}`,
    },
  ];
}

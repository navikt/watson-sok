import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const fnr = searchParams.get("fnr");

  if (!fnr || fnr.length !== 11) {
    return new Response("fnr mangler", { status: 400 });
  }

  return Response.json({
    fnr,
    relasjoner: [
      {
        type: "Barn",
        navn: "Emma Nordmann",
        fødselsdato: "2015-04-22",
        fnr: "15041512345",
        borSammen: true,
      },
      {
        type: "Ektefelle",
        navn: "Kari Nordmann",
        fødselsdato: "1980-06-15",
        fnr: "15068054321",
        borSammen: true,
      },
      {
        type: "Forelder",
        navn: "Ole Nordmann",
        fødselsdato: "1955-09-10",
        fnr: "10095598765",
        borSammen: false,
      },
    ],
    sistOppdatert: new Date().toISOString(),
  });
}

import { data, type ActionFunctionArgs } from "react-router";
import {
  parsePreferanser,
  preferanserCookie,
  type Preferanser,
} from "~/preferanser/PreferanserCookie";

export async function action({ request }: ActionFunctionArgs) {
  const [formData, eksisterendeVerdi] = await Promise.all([
    request.formData(),
    preferanserCookie.parse(request.headers.get("Cookie")),
  ]);

  const eksisterende = parsePreferanser(eksisterendeVerdi);

  const oppdatert: Preferanser = { ...eksisterende };

  for (const [key, value] of formData.entries()) {
    if (key in oppdatert && typeof value === "string") {
      (oppdatert as Record<string, string>)[key] = value;
    }
  }

  const validert = parsePreferanser(oppdatert);

  return data(
    { success: true, preferanser: validert },
    {
      status: 200,
      headers: {
        "Set-Cookie": await preferanserCookie.serialize(validert),
      },
    },
  );
}

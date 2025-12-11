import { type ActionFunctionArgs, data } from "react-router";
import { parseTheme, themeCookie } from "~/features/tema/ThemeCookie";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const theme = formData.get("theme")?.toString();

  if (!theme) {
    return data({ error: "Theme is required" }, { status: 400 });
  }

  const parsedTheme = parseTheme(theme);

  // Create response with the cookie set
  return data(
    { success: true, theme: parsedTheme },
    {
      status: 200,
      headers: {
        "Set-Cookie": await themeCookie.serialize(parsedTheme),
      },
    },
  );
}

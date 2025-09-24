import { createCookieSessionStorage } from "react-router";
import { env } from "~/config/env.server";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<IdentSessionData, IdentFlashData>({
    cookie: {
      name: "ident",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      secrets: [env.IDENT_SESSION_SECRET],
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    },
  });

export async function lagreIdentPåSession(ident: string, request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!ident.match(/^\d{11}$/)) {
    session.flash("error", "Ugyldig fødselsnummer");
    return commitSession(session);
  }

  session.set("ident", ident);
  return commitSession(session);
}

export async function hentIdentFraSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("ident") ?? null;
}

export async function slettIdentFraSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return destroySession(session);
}

type IdentSessionData = {
  ident: string;
};

type IdentFlashData = {
  error?: string;
};

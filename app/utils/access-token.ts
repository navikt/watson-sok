import {
  getToken,
  parseAzureUserToken,
  requestOboToken,
  validateToken,
} from "@navikt/oasis";
import { redirect } from "react-router";
import { env, isDev, isProd } from "~/config/env.server";

interface LoggedInUserResponse {
  preferredUsername: string;
  name: string;
  navIdent: string;
  token: string;
}

type GetLoggedInUserProps = {
  request: Request;
};
export async function getLoggedInUser({
  request,
}: GetLoggedInUserProps): Promise<LoggedInUserResponse> {
  if (!isProd) {
    console.log("DEVELOPMENT.. returning mock username");
    return MOCKED_LOGGED_IN_USER_RESPONSE;
  }
  console.log("GCP DEV.. returning real username");
  const token = await getValidToken(request);

  const parseResult = parseAzureUserToken(token);
  if (!parseResult.ok) {
    console.log("Token parse result not ok");
    throw redirect(`/oauth2/login`);
  }

  return {
    preferredUsername: parseResult.preferred_username,
    name: parseResult.name,
    navIdent: parseResult.NAVident,
    token,
  };
}

export async function getnavpersondataapiOboToken(
  request: Request,
): Promise<string> {
  return getOboToken({
    request,
    audience: `api://${env.NAV_PERSONDATA_API_CLUSTER}.holmes.nav-persondata-api/.default`,
  });
}

type GetOboTokenArgs = {
  request: Request;
  audience: string;
};
async function getOboToken({
  request,
  audience,
}: GetOboTokenArgs): Promise<string> {
  if (isDev) {
    return "fake-local-token";
  }

  const token = await getValidToken(request);

  const obo = await requestOboToken(token, audience);
  if (!obo.ok) {
    console.log("OBO token not ok", obo.error);
    throw redirect(`/oauth2/login`);
  }

  return obo.token;
}

async function getValidToken(request: Request): Promise<string> {
  const authHeader = request.headers.get("Authorization");

  if (isDev) {
    return "fake-local-token";
  }

  if (authHeader == null) {
    console.log("No Authorization header");
    throw redirect(`/oauth2/login`);
  }

  const token: string | null | undefined = getToken(authHeader);
  if (!token) {
    console.log("No token");
    throw redirect(`/oauth2/login`);
  }

  const validationResult = await validateToken(token);
  if (!validationResult.ok) {
    console.log("Validation result not ok");
    throw redirect(`/oauth2/login`);
  }

  return token;
}

const MOCKED_LOGGED_IN_USER_RESPONSE: LoggedInUserResponse = {
  preferredUsername: "some-username@trygdeetaten.no",
  name: "Some name",
  navIdent: "S123456",
};

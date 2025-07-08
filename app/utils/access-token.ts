import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
    getToken,
    requestOboToken,
    validateToken,
    parseAzureUserToken,
} from "@navikt/oasis";
import { isDevOrTest } from "@/app/utils/is-dev-or-test";

const NAV_PERSONDATA_API_CLUSTER = process.env.NAV_PERSONDATA_API_CLUSTER!; //Oppslag-bruker-backend tjeneste


interface LoggedInUserResponse {
    preferredUsername: string;
    name: string;
    navIdent: string;
}

export async function getLoggedInUser(): Promise<LoggedInUserResponse> {
    if (isDevOrTest()) {
        console.log("DEVELOPMENT.. returning mock username");
        return MOCKED_LOGGED_IN_USER_RESPONSE;
    }
    console.log("GCP DEV.. returning real username");
    const token = await getValidToken();

    const parseResult = parseAzureUserToken(token);
    console.log("TOKEN RESPONSE", parseResult);

    if (!parseResult.ok) {
        console.log("Token parse result not ok");
        redirect(`/oauth2/login`);
    }

    return {
        preferredUsername: parseResult.preferred_username,
        name: parseResult.name,
        navIdent: parseResult.NAVident,
    };
}

export async function getnavpersondataapiOboToken(): Promise<string> {
    return getOboToken(
        `api://${NAV_PERSONDATA_API_CLUSTER}.holmes.nav-persondata-api/.default`,
    );
}

async function getOboToken(audience: string): Promise<string> {
    if (process.env.NODE_ENV === "development") {
        return "fake-local-token";
    }

    const token = await getValidToken();

    const obo = await requestOboToken(token, audience);
    if (!obo.ok) {
        console.log("OBO token not ok", obo.error);
        redirect(`/oauth2/login`);
    }

    return obo.token;
}

async function getValidToken(): Promise<string> {
    const requestHeaders = await headers();

    if (process.env.NODE_ENV === "development") {
        return "fake-local-token";
    }

    const authHeader = requestHeaders.get("Authorization");

    if (authHeader == null) {
        console.log("No Authorization header");
        redirect(`/oauth2/login`);
    }

    const token: string | null | undefined = getToken(authHeader);
    if (!token) {
        console.log("No token");
        redirect(`/oauth2/login`);
    }

    const validationResult = await validateToken(token);
    if (!validationResult.ok) {
        console.log("Validation result not ok");
        redirect(`/oauth2/login`);
    }

    return token;
}

const MOCKED_LOGGED_IN_USER_RESPONSE: LoggedInUserResponse = {
    preferredUsername: "some-username@trygdeetaten.no",
    name: "Some name",
    navIdent: "S123456",
};
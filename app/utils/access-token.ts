import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
    getToken,
    requestOboToken,
    validateToken,
    parseAzureUserToken,
} from "@navikt/oasis";
import { isDevOrTest } from "@/app/utils/is-dev-or-test";

const REPR_FULLMAKT_CLUSTER = process.env.REPR_FULLMAKT_CLUSTER!;
const PDL_CLUSTER = process.env.PDL_CLUSTER!;

interface LoggedInUserResponse {
    preferredUsername: string;
    name: string;
    navIdent: string;
}

export async function getLoggedInUser(): Promise<LoggedInUserResponse> {
    if (isDevOrTest()) {
        return MOCKED_LOGGED_IN_USER_RESPONSE;
    }

    const token = await getValidToken();

    const parseResult = parseAzureUserToken(token);

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

export async function getReprFullmaktOboToken(): Promise<string> {
    return getOboToken(
        `api://${REPR_FULLMAKT_CLUSTER}.repr.repr-fullmakt/.default`,
    );
}

export async function getPdlOboToken(): Promise<string> {
    return getOboToken(`api://${PDL_CLUSTER}.pdl.pdl-api/.default`);
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
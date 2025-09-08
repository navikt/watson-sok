;
import "@navikt/ds-css";
import { FeatureProvider } from "./context/FeatureContext";
import { UserProvider } from "./context/UserContext";
import { UserSearchProvider } from "./context/UserSearchContext"; // 👈 LEGG TIL DENNE
import "./page.module.css";
import { Page } from "@navikt/ds-react";
import HolmesHeader from "./components/header/holmesHeader";
import { getLoggedInUser } from "@/app/utils/access-token";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "oppslag-bruker",
    description: "oppslag-bruker",
};
const RootLayout = async ({
                              children,
                          }: Readonly<{ children: React.ReactNode }>) => {
    const loggedInUser = await getLoggedInUser();


    return (
        <html lang="no">
        <head />
        <body>
        <Page>
            <UserProvider user={loggedInUser}>
                <UserSearchProvider> {/* 👈 NÅ ER DEN PÅ PLASS */}
                    <FeatureProvider>
                        <HolmesHeader />
                        {children}
                    </FeatureProvider>
                </UserSearchProvider>
            </UserProvider>
        </Page>
        </body>
        </html>
    );
};

export default RootLayout;

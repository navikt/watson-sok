
import Script from "next/script";
import "@navikt/ds-css";
import { FeatureProvider } from "./context/FeatureContext";
import { UserProvider } from "./context/UserContext";
import { fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr";
import "./page.module.css";
import { Page } from "@navikt/ds-react";
import HolmesHeader from "./components/header/holmesHeader";
import {getLoggedInUser, getnavpersondataapiOboToken} from "@/app/utils/access-token";
import {Metadata} from "next";


export const metadata: Metadata = {
  title: "oppslag-bruker",
  description: "oppslag-bruker",
};

const audience = `${process.env.NAIS_CLUSTER_NAME}:${process.env.NAIS_NAMESPACE}:oppslag-bruker-api`;
console.log(audience);
const RootLayout = async ({
                            children,
                          }: Readonly<{ children: React.ReactNode }>) => {

    const oboToken = await getnavpersondataapiOboToken();
    console.log(oboToken);
    const loggedInUser = await getLoggedInUser()
    console.log("loggedInUser -> "+loggedInUser)

  return (
      <html lang="no">
      <head>
      </head>
      <body>
      <Page>
          <UserProvider user={loggedInUser}>
          <FeatureProvider>
        <HolmesHeader/>
        {children}
          </FeatureProvider>
          </UserProvider>ß
      </Page>
      </body>
      </html>
  );
};

export default RootLayout;
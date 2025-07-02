import type {GetServerSideProps, Metadata} from "next";
import Script from "next/script";
import "@navikt/ds-css";
import { FeatureProvider } from "./context/FeatureContext";
import { UserProvider } from "./context/UserContext";
import { fetchDecoratorReact } from "@navikt/nav-dekoratoren-moduler/ssr";
import {LoggedInUserResponse, User} from "@/app/types/user";
import "./page.module.css";
import { Page } from "@navikt/ds-react";
import HolmesHeader from "./components/header/holmesHeader";
import { validateToken, requestOboToken, getToken } from "@navikt/oasis";
import {Histogram} from "prom-client";
import {getLoggedInUser} from "@/app/utils/access-token";

export const metadata: Metadata = {
  title: "oppslag-bruker-api",
  description: "oppslag-bruker-api",
};

const audience = `${process.env.NAIS_CLUSTER_NAME}:${process.env.NAIS_NAMESPACE}:oppslag-bruker-api`;
console.log(audience);
const RootLayout = async ({
                            children,
                          }: Readonly<{ children: React.ReactNode }>) => {
  const Decorator = await fetchDecoratorReact({
    env: "prod",
  });
    async function getUser(): Promise<User | null> {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/user`


        try {
            console.log(`[getUser] Henter bruker fra: ${url}`)

            const res = await fetch(url, {
                cache: 'no-store', // unngå caching i dev
            })

            console.log(`[getUser] Statuskode: ${res.status}`)

            if (!res.ok) {
                console.warn(`[getUser] Feil ved henting av bruker: ${res.statusText}`)
                return null
            }

            const user = await res.json()
            console.log(`[getUser] Brukerdata mottatt:`, user)

            return user
        } catch (error) {
            console.error(`[getUser] Uventet feil:`, error)
            return null
        }
    }

    async function getLoggedInUser(): Promise<LoggedInUserResponse | null> {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/logged-in-user`


        try {
            console.log(`[logged-in-user] Henter bruker fra: ${url}`)

            const res = await fetch(url, {
                cache: 'no-store', // unngå caching i dev
            })

            console.log(`[logged-in-user] Statuskode: ${res.status}`)

            if (!res.ok) {
                console.warn(`[logged-in-user] Feil ved henting av bruker: ${res.statusText}`)
                return null
            }

            const user = await res.json()
            console.log(`[logged-in-user] Brukerdata mottatt:`, user)

            return user
        } catch (error) {
            console.error(`[logged-in-user] Uventet feil:`, error)
            return null
        }
    }

    const loggedInUser = await getLoggedInUser()
    console.log("loggedInUser -> "+loggedInUser)

  return (
      <html lang="no">
      <head>
        <Decorator.HeadAssets />
      </head>
      <body>
      <Page>
          <UserProvider user={loggedInUser}>
          <FeatureProvider>
        <HolmesHeader/>
        {children}
          </FeatureProvider>
          </UserProvider>
        <Decorator.Scripts loader={Script} />

      </Page>
      </body>
      </html>
  );
};

export default RootLayout;
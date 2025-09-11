import { getLoggedInUser } from "@/utils/access-token";
import { Metadata } from "next";
import HolmesHeader from "./components/header/holmesHeader";
import { FeatureProvider } from "./context/FeatureContext";
import { UserProvider } from "./context/UserContext";
import { UserSearchProvider } from "./context/UserSearchContext"; // 👈 LEGG TIL DENNE
import "./globals.css";

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
        <UserProvider user={loggedInUser}>
          <UserSearchProvider>
            <FeatureProvider>
              <HolmesHeader />
              {children}
            </FeatureProvider>
          </UserSearchProvider>
        </UserProvider>
      </body>
    </html>
  );
};

export default RootLayout;

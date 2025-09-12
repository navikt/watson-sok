import { Outlet } from "react-router";
import { AppHeader } from "~/components/header/Header";

export default function RootLayout() {
  return (
    <div>
      <AppHeader />
      <main id="maincontent">
        <Outlet />
      </main>
    </div>
  );
}

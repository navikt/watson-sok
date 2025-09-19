import { Outlet } from "react-router";
import { AppFooter } from "~/components/footer/AppFooter";
import { AppHeader } from "~/components/header/Header";

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main id="maincontent" className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

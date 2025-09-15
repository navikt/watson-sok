import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";

export function useUser() {
  const rootLoaderData = useRouteLoaderData<typeof rootLoader>("root");
  if (!rootLoaderData) {
    throw new Error("Root loader data not found");
  }
  if (!rootLoaderData.user) {
    throw new Error("User not found");
  }
  return rootLoaderData.user;
}

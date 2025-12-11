import { unstable_useRoute } from "react-router";

export function useUser() {
  const rootLoaderData = unstable_useRoute("root");
  if (!rootLoaderData?.loaderData?.user) {
    throw new Error("User not found");
  }
  return rootLoaderData.loaderData.user;
}

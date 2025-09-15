import { redirect } from "react-router";

/** We don't have our own security.txt, so we refer to Nav's central one */
export function loader() {
  return redirect("https://www.nav.no/.well-known/security.txt", {
    status: 301,
  });
}

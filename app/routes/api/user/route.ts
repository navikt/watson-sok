import type { User } from "~/types/user";

export async function loader() {
  const user: User = {
    id: "1",
    name: "Ola Nordmann",
  };

  return user;
}

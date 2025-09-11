"use client";

import type { LoggedInUserResponse } from "@/types/user";
import { createContext, useContext } from "react";

export const UserContext = createContext<LoggedInUserResponse | null>(null);
export const useUser = () => useContext(UserContext);

export function UserProvider({
  user,
  children,
}: {
  user: LoggedInUserResponse | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

'use client'

import { createContext, useContext } from 'react'
import type { LoggedInUserResponse } from '@/app/types/user'

export const UserContext = createContext<LoggedInUserResponse | null>(null)
export const useUser = () => useContext(UserContext)

export function UserProvider({
                                 user,
                                 children,
                             }: {
    user: LoggedInUserResponse | null
    children: React.ReactNode
}) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

'use client'

import { createContext, useContext } from 'react'
import type { User } from '@/app/types/user'

export const UserContext = createContext<User | null>(null)
export const useUser = () => useContext(UserContext)

export function UserProvider({
                                 user,
                                 children,
                             }: {
    user: User | null
    children: React.ReactNode
}) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

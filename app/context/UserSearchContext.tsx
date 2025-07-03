"use client";

import { createContext, useContext, useState } from "react";

const UserSearchContext = createContext<{
    fnr: string | null;
    setFnr: (fnr: string) => void;
}>({
    fnr: null,
    setFnr: () => {},
});

export const UserSearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [fnr, setFnr] = useState<string | null>(null);

    return (
        <UserSearchContext.Provider value={{ fnr, setFnr }}>
            {children}
        </UserSearchContext.Provider>
    );
};

export const useUserSearch = () => useContext(UserSearchContext);

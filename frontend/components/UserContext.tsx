"use client";
import React from 'react';

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { email: string } | null;

type UserContextValue = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const email = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    if (token && email) {
      setUser({ email });
    }
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

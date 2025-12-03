'use client';
import { createContext, useContext, useState } from 'react';

const UserContext = createContext(undefined); 

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return { user: null, setUser: () => {} };
  }
  return context;
}
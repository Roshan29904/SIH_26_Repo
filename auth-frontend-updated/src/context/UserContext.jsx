import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  function setSignupUser({ username, email }) {
    setUser({ username, email, phone: null });
  }

  function setLoginUser(userData) {
    if (!userData) {
      setUser(null);
      return;
    }

    setUser({
      id: userData.id,
      username: userData.name || userData.username || null,
      email: userData.email || null,
      phone: null,
      emailVerified: userData.emailVerified,
      enabled: userData.enabled,
      role: userData.role,
      createdAt: userData.createdAt,
    });
  }

  function clearUser() {
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, setSignupUser, setLoginUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

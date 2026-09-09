import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // { username, email, phone }

  // Called right after Signup succeeds.
  function setSignupUser({ username, email, phone }) {
    setUser({ username, email, phone: phone || null });
  }

  // data returned form bacckend--username + email
  function setLoginUser(userData) {
    if (!userData) {
      setUser(null);
      return;
    }
    setUser({
      username: userData.username || null,
      email: userData.email,
      phone: userData.phone || null,
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
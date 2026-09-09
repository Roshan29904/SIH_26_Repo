import { createContext, useContext, useState } from "react";

const AuthFlowContext = createContext(null);

export function AuthFlowProvider({ children }) {
  const [pendingEmail, setPendingEmail] = useState(null);

  return (
    <AuthFlowContext.Provider value={{ pendingEmail, setPendingEmail }}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) throw new Error("useAuthFlow must be used inside AuthFlowProvider");
  return ctx;
}

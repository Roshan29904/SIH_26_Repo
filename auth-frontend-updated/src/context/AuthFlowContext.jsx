import { createContext, useContext, useState } from "react";

const AuthFlowContext = createContext(null);

export function AuthFlowProvider({ children }) {
  const [pendingEmail, setPendingEmail] = useState(null);
  const [verificationType, setVerificationType] = useState(null); // "signup" | "login"

  function startVerification(email, type) {
    setPendingEmail(email);
    setVerificationType(type);
  }

  function clearVerification() {
    setPendingEmail(null);
    setVerificationType(null);
  }

  return (
    <AuthFlowContext.Provider
      value={{
        pendingEmail,
        verificationType,
        startVerification,
        clearVerification,
      }}
    >
      {children}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) throw new Error("useAuthFlow must be used inside AuthFlowProvider");
  return ctx;
}

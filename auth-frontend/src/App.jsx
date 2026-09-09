import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Chat from "./pages/Chat";
import { AuthFlowProvider } from "./context/AuthFlowContext";
import { ChatProvider } from "./context/ChatContext";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>      // all information about the user - username , phone ...
      <AuthFlowProvider>    // helps in keeping the email-detail between signup and otp page 
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
          <Route path="/verify-otp" element={<AuthLayout><VerifyOtp /></AuthLayout>} />
          <Route
            path="/chat"
            element={
              //<RequireAuth>
                <ChatProvider>    //chat interface 
                  <Chat />
                </ChatProvider>
              //</RequireAuth>
            }
          />
        </Routes>
      </AuthFlowProvider>
    </UserProvider>
  );
}

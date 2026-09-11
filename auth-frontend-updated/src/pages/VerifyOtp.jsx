import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { verifySignupOtp, verifyLoginOtp, saveAuthTokens, getCurrentUser } from "../services/api";
import { useAuthFlow } from "../context/AuthFlowContext";
import { useUser } from "../context/UserContext";

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { pendingEmail, verificationType, clearVerification } = useAuthFlow();
  const { setLoginUser } = useUser();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  function handleChange(index, e) {
    const value = e.target.value;
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < Math.min(pasted.length, OTP_LENGTH); i++) {
      next[i] = pasted[i];
    }
    setDigits(next);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!pendingEmail || !verificationType) {
      navigate("/login");
      return;
    }

    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }

    setLoading(true);

    try {
      if (verificationType === "signup") {
        await verifySignupOtp({ email: pendingEmail, otp });
        clearVerification();
        navigate("/login");
      } else {
        const auth = await verifyLoginOtp({ email: pendingEmail, otp });
        saveAuthTokens(auth);

        const user = await getCurrentUser();
        setLoginUser(user);

        clearVerification();
        navigate("/chat");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={verificationType === "login" ? "Verify login OTP" : "Verify your email"}>
      <form onSubmit={handleSubmit} className="auth-form auth-form--otp">
        <p className="auth-form__hint">
          {pendingEmail
            ? `Enter the 6-digit code sent to ${pendingEmail}.`
            : "Your verification session has expired."}
        </p>

        <div className="otp-boxes">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              autoComplete={index === 0 ? "one-time-code" : "off"}
            />
          ))}
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <button type="submit" className="confirm-btn" disabled={loading}>
          {loading ? "Verifying..." : "Confirm OTP"}
        </button>

        <button
          type="button"
          className="text-btn"
          onClick={() => navigate(verificationType === "signup" ? "/signup" : "/login")}
        >
          Back
        </button>
      </form>
    </AuthCard>
  );
}

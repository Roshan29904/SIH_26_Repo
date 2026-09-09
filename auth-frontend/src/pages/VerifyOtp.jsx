import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { verifyOtp, resendOtp } from "../services/api";
import { useAuthFlow } from "../context/AuthFlowContext";

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { pendingEmail } = useAuthFlow();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);

  function handleChange(index, e) {    //runs when entering the  otp 
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

  async function handleSubmit(e) {          //NEEDS BACKEND VERIFICATION
    e.preventDefault();
    setError("");

    if (!pendingEmail) {
      navigate("/signup");
      return;
    }

    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email: pendingEmail, otp });         //sending otp to backend
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!pendingEmail) return;
    setResendMessage("");
    try {
      await resendOtp({ email: pendingEmail });
      setResendMessage("A new OTP has been sent.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthCard title="Enter the OTP sent to your email">
      <form onSubmit={handleSubmit} className="auth-form auth-form--otp">
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
            />
          ))}
        </div>

        {error && <p className="auth-form__error">{error}</p>}
        {resendMessage && <p className="auth-form__hint">{resendMessage}</p>}

        <button type="submit" className="confirm-btn" disabled={loading}>
          {loading ? "Confirming..." : "Confirm OTP"}
        </button>

        <button type="button" className="text-btn" onClick={handleResend}>
          Resend OTP
        </button>
      </form>
    </AuthCard>
  );
}

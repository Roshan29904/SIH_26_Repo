import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import FormField from "../components/FormField";
import { login } from "../services/api";
import { useAuthFlow } from "../context/AuthFlowContext";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const { startVerification } = useAuthFlow();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      startVerification(form.email, "login");
      navigate("/verify-otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    console.log("Google login is not provided by the current backend.");
  }

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit} className="auth-form">
        <FormField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <Link to="/forgot-password" className="auth-form__link">
          Forgot password?
        </Link>

        <div className="auth-form__divider">
          <span>Login with</span>
          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={16} /> Google
          </button>
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>

        <p className="auth-form__footer">
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </AuthCard>
  );
}

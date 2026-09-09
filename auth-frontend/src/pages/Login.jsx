import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import FormField from "../components/FormField";
import { login } from "../services/api";
import { useUser } from "../context/UserContext";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const { setLoginUser } = useUser();
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
      const data = await login(form);
      // Adjust to whatever the backend actually returns.
      

      if (data?.token) localStorage.setItem("authToken", data.token);
      setLoginUser(data?.user); // username returned form backend
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    console.log("TODO: Google login");       //NEEDS GOOGLE AUTHENTICATION
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
            <GoogleIcon /> Google
          </button>
        </div>

        {error && <p className="auth-form__error">{error}</p>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-form__footer">
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </AuthCard>
  );
}
function GoogleIcon(){
  return <FcGoogle size={16} />
}


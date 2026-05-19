import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    setResetToken("");

    try {
      const response = await forgotPassword({ email });
      setMessage(response.message);
      setResetToken(response.resetToken || "");
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : "Unable to send reset link");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-content">
        <Link className="brand-lockup login-brand public-auth-brand" to="/">
          <span className="brand-mark">S</span>
          <strong>Sphere</strong>
        </Link>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-heading">
            <h1>Forgot Password</h1>
            <p>Enter your email and we will create a reset token</p>
          </div>

          <label className="field">
            <span>Email Address</span>
            <input
              autoComplete="email"
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setMessage("");
              }}
              required
              type="email"
              value={email}
            />
          </label>

          {error && <div className="login-error">{error}</div>}
          {message && <div className="content-message success">{message}</div>}
          {resetToken && (
            <div className="demo-card">
              <strong>Development reset token</strong>
              <span>{resetToken}</span>
            </div>
          )}

          <button className="primary-button login-submit" disabled={isSaving} type="submit">
            {isSaving ? "Sending..." : "Send Reset Token"}
          </button>

          <p className="signup-copy">
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default ForgotPasswordPage;

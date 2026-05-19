import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login", { replace: true });
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create account");
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
            <h1>Create Account</h1>
            <p>Start managing your retail storefront</p>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              autoComplete="name"
              onChange={(event) => updateField("name", event.target.value)}
              required
              value={form.name}
            />
          </label>

          <label className="field">
            <span>Email Address</span>
            <input
              autoComplete="email"
              onChange={(event) => updateField("email", event.target.value)}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => updateField("password", event.target.value)}
              required
              type="password"
              value={form.password}
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="primary-button login-submit" disabled={isSaving} type="submit">
            {isSaving ? "Creating..." : "Create Account"}
          </button>

          <p className="signup-copy">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default SignupPage;

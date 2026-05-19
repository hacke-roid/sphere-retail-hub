import { Eye, Github, Mail } from "lucide-react";
import { Loader } from "../components/Loader";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { error, isLoading, login, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login({ email, password }).catch(() => undefined);
  };

  return (
    <main className="login-page">
      <section className="login-content">
        <div className="brand-lockup login-brand">
          <span className="brand-mark">S</span>
          <strong>Sphere</strong>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-heading">
            <h1>Welcome Back</h1>
            <p>Sign in to manage your retail platform</p>
          </div>

          <label className="field">
            <span>Email Address</span>
            <input
              autoComplete="email"
              onChange={(event) => {
                clearError();
                setEmail(event.target.value);
              }}
              placeholder="demo@example.com"
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span className="field-row">
              Password
              <Link className="link-button" to="/forgot-password">
                Forgot?
              </Link>
            </span>
            <span className="password-control">
              <input
                autoComplete="current-password"
                onChange={(event) => {
                  clearError();
                  setPassword(event.target.value);
                }}
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                <Eye size={17} />
              </button>
            </span>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button
            className="primary-button login-submit"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? <Loader message="Signing in" variant="button" /> : "Sign In"}
          </button>

          <div className="divider">
            <span />
            <p>Or continue with</p>
            <span />
          </div>

          <div className="social-actions">
            <button type="button">
              <Mail size={17} />
              Email
            </button>
            <button type="button">
              <Github size={17} />
              GitHub
            </button>
          </div>

          <p className="signup-copy">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;

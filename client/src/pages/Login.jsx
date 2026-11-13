import { apiUrl } from "../config/api";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        apiUrl("/api/auth/login"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      login(data.token, data.user);

      setSuccess("Login successful! Welcome back.");

      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.error(error);

      setError(
        error.message || "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-background-glow login-glow-one"></div>
      <div className="login-background-glow login-glow-two"></div>

      <section className="login-layout">
        <div className="login-visual">
          <div className="login-visual-content">
            <span className="login-eyebrow">
              <span className="login-eyebrow-dot"></span>
              YOUR NEXT ADVENTURE STARTS HERE
            </span>

            <h1>
              The world is
              <br />
              waiting <span>for you.</span>
            </h1>

            <p>
              Discover extraordinary places, plan unforgettable
              journeys, and make every trip a story worth telling.
            </p>

            <div className="login-travel-image">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1100&q=85"
                alt="Beautiful mountain landscape"
              />

              <div className="login-image-overlay"></div>

              <div className="login-image-caption">
                <span className="login-image-icon">✦</span>

                <div>
                  <strong>Adventure awaits</strong>
                  <p>Find your next favourite destination</p>
                </div>
              </div>
            </div>

            <div className="login-travel-stats">
              <div>
                <strong>Explore</strong>
                <span>New destinations</span>
              </div>

              <div>
                <strong>Discover</strong>
                <span>Hidden gems</span>
              </div>

              <div>
                <strong>Experience</strong>
                <span>Unforgettable trips</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-card">
            <Link to="/" className="login-brand">
              <span className="login-brand-icon">✦</span>

              <span>
                Travel
                <span className="login-brand-accent">
                  Explorer
                </span>
              </span>
            </Link>

            <div className="login-heading">
              <span className="login-welcome-label">
                WELCOME BACK
              </span>

              <h2>Sign in to your account</h2>

              <p>
                Your next adventure is just a login away.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <div className="login-password-label">
                  <label htmlFor="password">
                    Password
                  </label>
                </div>

                <div className="login-input-wrapper">
                  <span className="login-input-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="3" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      <path d="M12 14v3" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="login-message login-error" role="alert">
                  <span aria-hidden="true">!</span>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="login-message login-success" role="status">
                  <span aria-hidden="true">✓</span>
                  <p>{success}</p>
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Signing you in..." : "Sign in"}
                </span>

                {!loading && (
                  <span className="login-button-arrow">
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>NEW TO TRAVEL EXPLORER?</span>
            </div>

            <p className="signup-link">
              Don't have an account?{" "}
              <Link to="/signup">
                Create an account
              </Link>
            </p>

            <Link to="/" className="back-to-explore">
              <span>←</span> Back to exploring
            </Link>
          </div>

          <p className="login-footer">
            Made for curious travellers <span>✦</span>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;

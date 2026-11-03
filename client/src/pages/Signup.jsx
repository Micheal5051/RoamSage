import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-background-glow signup-glow-one"></div>
      <div className="signup-background-glow signup-glow-two"></div>

      <section className="signup-layout">
        <div className="signup-visual">
          <div className="signup-visual-content">
            <span className="signup-eyebrow">
              <span className="signup-eyebrow-dot"></span>
              YOUR JOURNEY BEGINS HERE
            </span>

            <h1>
              Make room
              <br />
              for <span>wonder.</span>
            </h1>

            <p>
              Create your account and start discovering beautiful
              destinations, planning memorable trips, and finding
              experiences beyond the ordinary.
            </p>

            <div className="signup-travel-image">
              <img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1100&q=85"
                alt="Scenic lake surrounded by mountains"
              />

              <div className="signup-image-overlay"></div>

              <div className="signup-image-caption">
                <span className="signup-image-icon">✦</span>

                <div>
                  <strong>Your story starts now</strong>
                  <p>New places. New memories. New possibilities.</p>
                </div>
              </div>
            </div>

            <div className="signup-travel-stats">
              <div>
                <span className="signup-stat-icon">◎</span>
                <div>
                  <strong>Explore</strong>
                  <p>Places you'll love</p>
                </div>
              </div>

              <div>
                <span className="signup-stat-icon">↗</span>
                <div>
                  <strong>Plan</strong>
                  <p>Trips your way</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="signup-form-section">
          <div className="signup-card">
            <Link to="/" className="signup-brand">
              <span className="signup-brand-icon">✦</span>
              <span>
                Travel<span className="signup-brand-accent">Explorer</span>
              </span>
            </Link>

            <div className="signup-heading">
              <span className="signup-welcome-label">
                JOIN THE JOURNEY
              </span>

              <h2>Create your account</h2>

              <p>
                Sign up today and start planning your next adventure.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="signup-form-group">
                <label htmlFor="name">Full name</label>

                <div className="signup-input-wrapper">
                  <span className="signup-input-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
                    </svg>
                  </span>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="email">Email address</label>

                <div className="signup-input-wrapper">
                  <span className="signup-input-icon" aria-hidden="true">
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

              <div className="signup-form-group">
                <label htmlFor="password">Password</label>

                <div className="signup-input-wrapper">
                  <span className="signup-input-icon" aria-hidden="true">
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="signup-form-group">
                <label htmlFor="confirmPassword">Confirm password</label>

                <div className="signup-input-wrapper">
                  <span className="signup-input-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M5 12.5 10 17l9-10" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="signup-message signup-error" role="alert">
                  <span aria-hidden="true">!</span>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="signup-message signup-success" role="status">
                  <span aria-hidden="true">✓</span>
                  <p>{success}</p>
                </div>
              )}

              <button
                type="submit"
                className="signup-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Creating your account..." : "Create account"}
                </span>

                {!loading && (
                  <span className="signup-button-arrow">→</span>
                )}
              </button>
            </form>

            <div className="signup-divider">
              <span>ALREADY PART OF THE JOURNEY?</span>
            </div>

            <p className="login-link">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>

            <Link to="/" className="signup-back-link">
              <span>←</span> Back to exploring
            </Link>
          </div>

          <p className="signup-footer">
            Made for curious travellers <span>✦</span>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
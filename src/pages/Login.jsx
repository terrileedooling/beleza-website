import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>

        <div className="admin-notice">
          <i className="fas fa-lock"></i> Admin Access Only
        </div>

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-main">BELEZA</div>
              <div className="logo-subtitle">PROFESSIONAL</div>
            </div>
            <h1>Admin Login</h1>
            <p>Enter your credentials to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {/* Email Field - SIMPLIFIED */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="form-input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
            </div>

            {/* Password Field - SIMPLIFIED */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="form-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fas fa-eye${showPassword ? "-slash" : ""}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "" : "Log In"}
            </button>

            <div className="form-footer">
              <p>Need help?</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
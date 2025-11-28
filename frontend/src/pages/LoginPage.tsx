import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageChooser from "../components/LanguageChooser";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { login } from "../services/auth";

const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(username, password);
      console.log('Login successful:', response.user);
      
      // Update user state immediately so it's available without page refresh
      setUser(response.user);
      
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      }
      setError("Invalid username or password");
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <LanguageChooser />
      </div>
      <div className="card" style={{ width: '400px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">{t('auth.loginTitle')}</h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger text-center small">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                {t('auth.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="form-control"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-control"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn w-100 text-white"
              style={{ backgroundColor: '#053c2e' }}
            >
              {t('auth.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

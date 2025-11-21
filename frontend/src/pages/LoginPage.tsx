import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/"); // Redirect to home page after successful login
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
      }
      setError("Invalid username or password");
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card" style={{ width: '400px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Sign in</h2>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger text-center small">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                username
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
                Password
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
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

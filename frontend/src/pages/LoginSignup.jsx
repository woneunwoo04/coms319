import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function LoginSignup() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const nav = useNavigate();

  const canSubmit =
    tab === "login"
      ? form.email && form.password
      : form.name && form.email && form.password.length >= 6;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return setError("Please fill all required fields.");
    setError("");
    setLoading(true);
    try {
      if (tab === "login") await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
      nav("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white shadow rounded p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-4">
          {tab === "login" ? "Welcome Back ☕" : "Join Café Delight 🍰"}
        </h2>

        {/* ✅ 탭 전환 버튼 */}
        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group">
            <button
              onClick={() => setTab("login")}
              className={`btn ${tab === "login" ? "btn-dark" : "btn-outline-dark"}`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`btn ${tab === "signup" ? "btn-dark" : "btn-outline-dark"}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* ✅ 입력 폼 */}
        <form onSubmit={onSubmit}>
          {tab === "signup" && (
            <div className="mb-3">
              <input
                type="text"
                placeholder="Name"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="mb-3">
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <div className="alert alert-danger text-center py-2">{error}</div>}

          <button
            type="submit"
            className="btn btn-dark w-100 mt-2"
            disabled={!canSubmit || loading}
          >
            {loading ? "Working..." : tab === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {/* ✅ 전환 안내 */}
        <p className="text-center text-muted mt-3">
          {tab === "login"
            ? "Don’t have an account? "
            : "Already have an account? "}
          <span
            className="text-decoration-underline text-dark fw-semibold"
            role="button"
            onClick={() => setTab(tab === "login" ? "signup" : "login")}
          >
            {tab === "login" ? "Sign up here" : "Log in here"}
          </span>
        </p>
      </div>
    </div>
  );
}


// client/src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────
// Key change: handle the EMAIL_NOT_VERIFIED code from the server
// and show a contextual banner with a resend link.
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import api from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null); // ← NEW
  const [resendStatus, setResendStatus] = useState("idle");     // ← NEW
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname ?? "/";

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setIsLoading(true);

    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;

      // ── Handle unverified email  ← NEW ────────────────────────
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email ?? form.email);
      } else {
        setError(data?.message ?? "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend verification from login page  ← NEW ─────────────────
  const resendVerification = async () => {
    setResendStatus("loading");
    try {
      await api.post("/auth/resend-verification", { email: unverifiedEmail });
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1 font-serif">
          Welcome back
        </h1>
        <p className="text-gray-500 mb-8">Sign in to your BookHaven account</p>

        {/* Generic error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Email not verified banner  ← NEW */}
        {unverifiedEmail && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold mb-1">Email not verified</p>
            <p>
              Please verify <strong>{unverifiedEmail}</strong> before logging in.
              Check your inbox for the verification link.
            </p>
            {resendStatus === "idle" && (
              <button
                onClick={resendVerification}
                className="mt-2 text-orange-600 hover:underline font-medium"
              >
                Resend verification email →
              </button>
            )}
            {resendStatus === "loading" && (
              <p className="mt-2 text-orange-500">Sending…</p>
            )}
            {resendStatus === "sent" && (
              <p className="mt-2 text-green-600 font-medium">
                ✓ Verification email sent! Check your inbox.
              </p>
            )}
            {resendStatus === "error" && (
              <p className="mt-2 text-red-600">
                Failed to resend. Please try again.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-orange-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-orange-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
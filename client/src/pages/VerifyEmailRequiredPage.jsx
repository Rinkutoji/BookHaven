// client/src/pages/VerifyEmailRequiredPage.jsx
// Shown when a logged-in user hasn't verified their email yet.
// Lets them resend the verification email.

import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../lib/api";

export default function VerifyEmailRequiredPage() {
  const location = useLocation();
  const email = location.state?.email ?? "";

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const resend = async () => {
    setStatus("loading");
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      setMessage(
        err.response?.data?.message ?? "Something went wrong. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-orange-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
          Verify Your Email
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Your account is not yet verified. We sent a confirmation link to{" "}
          {email ? (
            <strong className="text-gray-700">{email}</strong>
          ) : (
            "your email address"
          )}
          . Please check your inbox (and spam folder).
        </p>

        {/* Feedback message */}
        {message && (
          <div
            className={`mb-5 rounded-lg px-4 py-3 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Resend button */}
        <button
          onClick={resend}
          disabled={status === "loading" || status === "success"}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
        >
          {status === "loading"
            ? "Sending…"
            : status === "success"
            ? "Email Sent ✓"
            : "Resend Verification Email"}
        </button>

        <p className="mt-6 text-sm text-gray-400">
          Wrong account?{" "}
          <Link to="/logout" className="text-orange-500 hover:underline">
            Sign out
          </Link>{" "}
          and log in with a different email.
        </p>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../context/authStore';

// ── State types ───────────────────────────────────────────────────────────────
const STATE = {
  LOADING: 'loading',
  SUCCESS: 'success',
  EXPIRED: 'expired',
  ERROR: 'error',
  RESENT: 'resent',
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState(STATE.LOADING);
  const [resending, setResending] = useState(false);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState(STATE.ERROR);
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setState(STATE.SUCCESS);
        // Update local user state to reflect verified status
        if (user) setUser({ ...user, isEmailVerified: true });
      })
      .catch((err) => {
        const msg = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          setState(STATE.EXPIRED);
        } else {
          setState(STATE.ERROR);
        }
      });
  }, []);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      setState(STATE.RESENT);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-warm p-8 text-center">

          {/* Loading */}
          {state === STATE.LOADING && (
            <>
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-2">
                Verifying your email…
              </h1>
              <p className="text-stone-500 text-sm">Please wait a moment.</p>
            </>
          )}

          {/* Success */}
          {state === STATE.SUCCESS && (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-3">
                Email Verified! 🎉
              </h1>
              <p className="text-stone-600 mb-8 leading-relaxed">
                Your BookHaven account is now fully activated. Start exploring thousands of books!
              </p>
              <Link
                to="/books"
                className="inline-block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Start Browsing
              </Link>
              <Link
                to="/"
                className="inline-block mt-3 text-sm text-stone-500 hover:text-brand-500 transition-colors"
              >
                Go to Home
              </Link>
            </>
          )}

          {/* Expired / Invalid */}
          {state === STATE.EXPIRED && (
            <>
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-9 h-9 text-amber-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-3">
                Link Expired
              </h1>
              <p className="text-stone-600 mb-8 leading-relaxed">
                This verification link has expired or already been used. We can send you a fresh one.
              </p>
              {user ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-2 w-full justify-center bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {resending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {resending ? 'Sending…' : 'Resend Verification Email'}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-center"
                >
                  Log in to resend
                </Link>
              )}
            </>
          )}

          {/* Resent */}
          {state === STATE.RESENT && (
            <>
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-9 h-9 text-brand-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-3">
                Email Sent!
              </h1>
              <p className="text-stone-600 mb-8 leading-relaxed">
                A new verification link has been sent to your email. Check your inbox and click the link.
              </p>
              <Link
                to="/"
                className="inline-block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Home
              </Link>
            </>
          )}

          {/* Generic error */}
          {state === STATE.ERROR && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-3">
                Something went wrong
              </h1>
              <p className="text-stone-600 mb-8 leading-relaxed">
                We couldn't verify your email. The link may be missing or malformed. Try logging in and requesting a new verification link.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Go to Login
              </Link>
            </>
          )}
        </div>

        {/* Branding */}
        <p className="text-center text-stone-400 text-xs mt-6">
          BookHaven — Your Literary Sanctuary
        </p>
      </div>
    </div>
  );
}
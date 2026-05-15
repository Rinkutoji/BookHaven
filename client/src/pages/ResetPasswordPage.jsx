import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-warm p-8 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="font-playfair text-xl font-bold text-stone-900 mb-2">Invalid Link</h1>
          <p className="text-stone-500 text-sm mb-6">This reset link is missing a token. Please request a new one.</p>
          <Link to="/forgot-password" className="text-brand-500 hover:text-brand-600 font-medium text-sm">
            Request new link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-warm p-8">
          {!success ? (
            <>
              <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-brand-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-2">
                Set new password
              </h1>
              <p className="text-stone-500 text-sm mb-6">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength.score
                                ? strength.score <= 1 ? 'bg-red-400'
                                  : strength.score === 2 ? 'bg-amber-400'
                                  : strength.score === 3 ? 'bg-yellow-400'
                                  : 'bg-green-500'
                                : 'bg-stone-100'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        strength.score <= 1 ? 'text-red-500'
                          : strength.score === 2 ? 'text-amber-500'
                          : strength.score === 3 ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-brand-100 outline-none transition-all ${
                      confirm && confirm !== password
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-stone-200 focus:border-brand-400'
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                  )}
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || password !== confirm}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-2">Password reset!</h1>
              <p className="text-stone-500 text-sm leading-relaxed">
                Your password has been updated. Redirecting you to login in a moment…
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 text-brand-500 hover:text-brand-600 font-medium text-sm"
              >
                Go to login →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)] };
}
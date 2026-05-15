import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-warm p-8">
          {!submitted ? (
            <>
              <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-brand-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-2">
                Forgot your password?
              </h1>
              <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                No problem. Enter your email and we'll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-stone-900 placeholder:text-stone-400"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-2">
                Check your inbox
              </h1>
              <p className="text-stone-500 text-sm leading-relaxed">
                If <strong className="text-stone-700">{email}</strong> is registered, you'll receive a reset link shortly. It expires in 1 hour.
              </p>
              <p className="text-stone-400 text-xs mt-4">
                Don't see it? Check your spam folder.
              </p>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-stone-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
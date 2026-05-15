import { useState } from 'react';
import { Mail, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
export default function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Don't show if: no user, verified, guest, or dismissed
  if (!user || user.isEmailVerified || user.isGuest || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5 text-sm">
          {sent ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-green-700 font-medium">
                Verification email sent! Check your inbox.
              </span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-800">
                Please verify your email address.{' '}
                <button
                  onClick={handleResend}
                  disabled={sending}
                  className="font-semibold underline hover:no-underline inline-flex items-center gap-1 disabled:opacity-60"
                >
                  {sending && <Loader2 className="w-3 h-3 animate-spin" />}
                  {sending ? 'Sending…' : 'Resend verification email'}
                </button>
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
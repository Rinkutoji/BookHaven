import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../context/authStore';
import { useCartStore } from '../context/cartStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { fetchCart } = useCartStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.user, data.accessToken);
      await fetchCart();
      toast.success(`Welcome to BookHaven, ${data.user.name.split(' ')[0]}! 📚`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-warm">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Join BookHaven</h1>
          <p className="text-ink-muted mt-2">Create your free account and start reading</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" placeholder="Name" required
                   value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="Email" required
                   value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-11"
                     placeholder="Min. 8 characters" required minLength={8}
                     value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              : 'Create Free Account'}
          </button>

          <p className="text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-medium hover:text-brand-600">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

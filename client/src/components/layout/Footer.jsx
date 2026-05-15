// client/src/components/layout/Footer.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

// TikTok SVG Icon (lucide-react មិនមាន TikTok icon ដូច្នេះប្រើ SVG ផ្ទាល់)
function TikTokIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5
               2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01
               a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34
               6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
    </svg>
  );
}

// បញ្ចូល links សម្រាប់ Social Media នៅទីនេះ
const SOCIAL_LINKS = [
  {
    Icon: Instagram,
    href: 'https://www.instagram.com/your_account',   // ← ប្តូរ URL របស់អ្នក
    label: 'Instagram',
  },
  {
    Icon: Twitter,
    href: 'https://www.twitter.com/your_account',     // ← ប្តូរ URL របស់អ្នក
    label: 'Twitter / X',
  },
  {
    Icon: Facebook,
    href: 'https://www.facebook.com/your_page',       // ← ប្តូរ URL របស់អ្នក
    label: 'Facebook',
  },
  {
    Icon: TikTokIcon,
    href: 'https://www.tiktok.com/@your_account',     // ← ប្តូរ URL របស់អ្នក
    label: 'TikTok',
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success('Subscribed successfully! 🎉');
      setEmail('');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Something went wrong.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-warm-900 text-cream-200 mt-20">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand — 2 cols */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-cream-100">
                Book<span className="text-brand-400">Haven</span>
              </span>
            </Link>
            <p className="text-sm text-cream-400 leading-relaxed">
              Your cozy corner for discovering stories that move you.
              Curated books, warm service, happy readers.
            </p>

            {/* Social Icons with real links */}
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center
                             justify-center hover:bg-brand-500 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-display font-semibold text-cream-100 mb-4">Discover</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/books',                 label: 'All Books'    },
                { to: '/books?featured=true',   label: 'Featured'     },
                { to: '/books?bestseller=true', label: 'Bestsellers'  },
                { to: '/books?newArrival=true', label: 'New Arrivals' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to}
                        className="text-sm text-cream-400 hover:text-brand-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display font-semibold text-cream-100 mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/profile',  label: 'My Profile'     },
                { to: '/orders',   label: 'Order History'  },
                { to: '/wishlist', label: 'Wishlist'       },
                { to: '/register', label: 'Create Account' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to}
                        className="text-sm text-cream-400 hover:text-brand-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-cream-100 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/about',   label: 'About Us'   },
                { to: '/contact', label: 'Contact Us' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to}
                        className="text-sm text-cream-400 hover:text-brand-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="font-display font-semibold text-cream-100 mb-1">
                Get book recommendations
              </h4>
              <p className="text-sm text-cream-400">Join 10,000+ readers. No spam, ever.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={handleSubscribe}>
              <div className="relative flex-1 md:w-72">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-500" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg
                             text-sm text-cream-100 placeholder-cream-500 focus:outline-none
                             focus:ring-2 focus:ring-brand-400 focus:bg-white/15"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-sm py-2.5 whitespace-nowrap disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row
                        items-center justify-between gap-3 text-xs text-cream-500">
          <p>© {year} BookHaven. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/privacy-policy"   className="hover:text-cream-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-cream-300 transition-colors">Terms of Service</Link>
            <Link to="/shipping-policy"  className="hover:text-cream-300 transition-colors">Shipping Policy</Link>
            <Link to="/about"            className="hover:text-cream-300 transition-colors">About</Link>
            <Link to="/contact"          className="hover:text-cream-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
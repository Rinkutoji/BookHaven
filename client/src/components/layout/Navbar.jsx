import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, BookOpen, Search, LogOut } from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useCartStore } from '../../context/cartStore';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import SearchBar from '../search/SearchBar'; // ← ថ្មី

export default function Navbar() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false); // ← ថ្មី — controls modal
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const navigate = useNavigate();

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  // ── Close search modal on Escape ─────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const navLinks = [
    { to: '/books',                   label: 'Browse'      },
    { to: '/books?featured=true',     label: 'Featured'    },
    { to: '/books?bestseller=true',   label: 'Bestsellers' },
    { to: '/books?newArrival=true',   label: 'New Arrivals'},
  ];

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-warm border-b border-cream-200'
            : 'bg-cream-50 border-b border-cream-200'
        )}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center
                              shadow-warm group-hover:bg-brand-600 transition-colors">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-ink hidden sm:block">
                Book<span className="text-brand-500">Haven</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-brand-500 bg-brand-50'
                        : 'text-ink-muted hover:text-ink hover:bg-cream-100'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* ── Desktop: Search trigger button (replaces old form) ── */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 w-52 px-3 py-2 bg-cream-100
                         border border-cream-300 rounded-lg text-sm text-ink-muted/70
                         hover:bg-white hover:border-brand-300 hover:text-ink-muted
                         transition-all focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <Search size={15} className="shrink-0" />
              <span className="flex-1 text-left">Search books...</span>
              {/* Keyboard shortcut hint */}
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5
                              text-[10px] font-medium text-ink-muted/50 bg-cream-200
                              border border-cream-300 rounded">
                ⌘K
              </kbd>
            </button>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-1">

              {/* Mobile search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden btn-ghost p-2"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {isAuthenticated && (
                <Link to="/wishlist" className="btn-ghost p-2 relative" title="Wishlist">
                  <Heart size={20} />
                </Link>
              )}

              <Link to="/cart" className="btn-ghost p-2 relative" title="Cart">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white
                                   text-[10px] font-bold rounded-full flex items-center justify-center
                                   animate-fade-in">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg
                                     hover:bg-cream-100 transition-colors text-sm font-medium text-ink">
                    <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-brand-600" />
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl
                                  shadow-warm-lg border border-cream-200 py-1
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <Link to="/profile"  className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-cream-50 transition-colors">
                      <User size={15} /> My Profile
                    </Link>
                    <Link to="/orders"   className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-cream-50 transition-colors">
                      <BookOpen size={15} /> My Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-cream-50 transition-colors">
                      <Heart size={15} /> Wishlist
                    </Link>
                    <hr className="my-1 border-cream-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm
                                 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link to="/login"    className="btn-ghost text-sm px-3 py-2">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Join Free</Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden btn-ghost p-2 ml-1"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-cream-200 animate-slide-down">
            <div className="page-container py-4 space-y-1">
              {/* Mobile search button inside drawer */}
              <button
                onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                className="w-full flex items-center gap-2 mb-3 px-4 py-2.5 bg-cream-100
                           border border-cream-300 rounded-lg text-sm text-ink-muted
                           hover:bg-white transition-colors"
              >
                <Search size={15} />
                Search books...
              </button>

              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    clsx('block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'text-brand-500 bg-brand-50' : 'text-ink hover:bg-cream-50'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Search modal overlay (outside <header> so it covers full screen) ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
                     flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}   // click backdrop → close
        >
          {/* Stop propagation so clicking inside the bar doesn't close modal */}
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SearchBar onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
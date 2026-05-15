import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, Shield, Headphones } from 'lucide-react';
import { booksApi } from '../lib/api';
import BookCard from '../components/books/BookCard';

const GENRES = [
  { name: 'Fiction',       emoji: '📖', color: 'bg-rose-100 text-rose-700' },
  { name: 'Non-Fiction',   emoji: '🧠', color: 'bg-blue-100 text-blue-700' },
  { name: 'Fantasy',       emoji: '🐉', color: 'bg-purple-100 text-purple-700' },
  { name: 'Science Fiction', emoji: '🚀', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Self-Help',     emoji: '💪', color: 'bg-green-100 text-green-700' },
  { name: 'Mystery',       emoji: '🔍', color: 'bg-amber-100 text-amber-700' },
  { name: 'Biography',     emoji: '👤', color: 'bg-teal-100 text-teal-700' },
  { name: 'History',       emoji: '🏛️', color: 'bg-orange-100 text-orange-700' },
];

const PERKS = [
  { icon: Truck,       title: 'Free Shipping',    desc: 'On orders over $35'    },
  { icon: RefreshCw,   title: 'Easy Returns',     desc: '30-day return policy'  },
  { icon: Shield,      title: 'Secure Payments',  desc: 'SSL encrypted checkout' },
  { icon: Headphones,  title: 'Expert Support',   desc: 'Mon-Fri, 9am-6pm'     },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, bestRes] = await Promise.all([
          booksApi.list({ featured: true, limit: 4 }),
          booksApi.list({ bestseller: true, limit: 4 }),
        ]);
        setFeatured(featRes.data.books);
        setBestsellers(bestRes.data.books);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const SkeletonCard = () => (
    <div className="card animate-pulse">
      <div className="aspect-[2/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/4 rounded mt-3" />
      </div>
    </div>
  );

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-warm-900 via-ink to-ink-light
                           overflow-hidden min-h-[520px] flex items-center">
        {/* Texture overlay */}
        <div className="absolute inset-0 bg-texture opacity-30" />

        {/* Decorative books pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 hidden lg:block">
          <div className="absolute top-8 right-16 w-32 h-44 bg-brand-400 rounded rotate-6" />
          <div className="absolute top-16 right-36 w-28 h-40 bg-cream-300 rounded -rotate-3" />
          <div className="absolute bottom-8 right-10 w-36 h-48 bg-brand-300 rounded rotate-2" />
          <div className="absolute bottom-20 right-44 w-24 h-36 bg-cream-400 rounded -rotate-6" />
        </div>

        <div className="page-container relative py-20">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block px-4 py-1.5 bg-brand-500/20 text-brand-300 text-sm
                             font-medium rounded-full mb-6 border border-brand-500/30">
              📚 Over 10,000 titles in stock
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-cream-100
                           leading-tight mb-6 text-balance">
              Find Your Next
              <span className="block text-brand-400">Favorite Story</span>
            </h1>
            <p className="text-cream-300 text-lg mb-10 max-w-xl leading-relaxed">
              Curated books for every reader. From timeless classics to today's
              bestsellers — discover, read, and get lost in a great book.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/books" className="btn-primary text-base px-7 py-3.5 shadow-warm-lg">
                Browse Books <ArrowRight size={18} />
              </Link>
              <Link to="/books?newArrival=true"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream-400/30
                               text-cream-200 rounded-lg hover:bg-white/10 transition-colors text-base">
                New Arrivals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[['10,000+', 'Books'], ['50,000+', 'Happy Readers'], ['4.9★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-cream-100">{val}</div>
                  <div className="text-cream-400 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Perks ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-cream-200">
        <div className="page-container py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center
                                flex-shrink-0">
                  <Icon size={20} className="text-brand-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{title}</div>
                  <div className="text-xs text-ink-muted">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Books ────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 font-medium text-sm mb-1">Hand-picked for you</p>
            <h2 className="section-title">Featured Books</h2>
          </div>
          <Link to="/books?featured=true"
                className="flex items-center gap-1.5 text-sm text-brand-500 font-medium
                           hover:text-brand-600 transition-colors">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((book) => <BookCard key={book._id} book={book} />)
          }
        </div>
      </section>

      {/* ── Genres ────────────────────────────────────────────────────────── */}
      <section className="bg-cream-100 py-16">
        <div className="page-container">
          <div className="text-center mb-10">
            <p className="text-brand-500 font-medium text-sm mb-1">Explore by category</p>
            <h2 className="section-title">Browse Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {GENRES.map(({ name, emoji, color }) => (
              <Link
                key={name}
                to={`/books?genre=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl
                           shadow-warm-sm hover:shadow-warm transition-all duration-200
                           hover:-translate-y-0.5 group"
              >
                <span className="text-2xl">{emoji}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bestsellers ───────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 font-medium text-sm mb-1">Loved by readers</p>
            <h2 className="section-title">Bestsellers</h2>
          </div>
          <Link to="/books?bestseller=true"
                className="flex items-center gap-1.5 text-sm text-brand-500 font-medium
                           hover:text-brand-600 transition-colors">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : bestsellers.map((book) => <BookCard key={book._id} book={book} />)
          }
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="bg-brand-500 py-16 mt-4">
        <div className="page-container text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to find your next great read?
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
            Browse thousands of titles and get free shipping on orders over $35.
          </p>
          <Link to="/books"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-600
                           font-semibold rounded-lg hover:bg-cream-100 transition-colors
                           shadow-warm-lg text-base">
            Start Browsing <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

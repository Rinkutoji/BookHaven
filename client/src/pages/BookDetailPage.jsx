import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, BookOpen, Package, ChevronLeft } from 'lucide-react';
import { booksApi, wishlistApi } from '../lib/api';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await booksApi.get(id);
        setBook(data.book);
      } catch {
        toast.error('Book not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return; }
    setAddingToCart(true);
    await addToCart(book._id, qty);
    setAddingToCart(false);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return; }
    try {
      const { data } = await wishlistApi.toggle(book._id);
      setWishlisted(data.added);
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await booksApi.addReview(id, review);
      toast.success('Review submitted!');
      const { data } = await booksApi.get(id);
      setBook(data.book);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="page-container py-12">
      <div className="flex flex-col md:flex-row gap-10 animate-pulse">
        <div className="skeleton w-56 h-80 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-5 w-1/3 rounded" />
          <div className="skeleton h-20 rounded" />
          <div className="skeleton h-10 w-1/4 rounded" />
        </div>
      </div>
    </div>
  );

  if (!book) return (
    <div className="page-container py-20 text-center">
      <p className="text-6xl mb-4">📚</p>
      <h2 className="font-display text-2xl mb-4">Book not found</h2>
      <Link to="/books" className="btn-primary">Back to Books</Link>
    </div>
  );

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <div className="page-container py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
        <Link to="/" className="hover:text-brand-500">Home</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-brand-500">Books</Link>
        <span>/</span>
        <span className="text-ink truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cover */}
        <div className="flex-shrink-0">
          <div className="relative w-56 mx-auto lg:mx-0">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full rounded-xl shadow-warm-xl"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/224x336/faf4e8/7a5c4a?text=${encodeURIComponent(book.title)}`;
              }}
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 badge bg-brand-500 text-white px-2.5 py-1 text-xs font-bold">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-3">
            {book.genre?.map((g) => (
              <Link key={g} to={`/books?genre=${encodeURIComponent(g)}`}
                    className="badge bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors">
                {g}
              </Link>
            ))}
          </div>

          <h1 className="font-display text-3xl lg:text-4xl font-bold text-ink mb-2 text-balance">
            {book.title}
          </h1>
          <p className="text-ink-muted text-lg mb-4">by <span className="text-ink font-medium">{book.author}</span></p>

          {/* Rating */}
          {book.numReviews > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={16}
                        className={s <= Math.round(book.rating) ? 'text-amber-400' : 'text-cream-300'}
                        fill={s <= Math.round(book.rating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm font-medium text-ink">{book.rating}</span>
              <span className="text-sm text-ink-muted">({book.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-display text-4xl font-bold text-brand-600">${book.price.toFixed(2)}</span>
            {book.originalPrice && (
              <span className="text-xl text-ink-muted line-through">${book.originalPrice.toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span className="badge bg-green-100 text-green-700 text-sm font-medium">
                Save ${(book.originalPrice - book.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-ink leading-relaxed mb-6 max-w-2xl">{book.description}</p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            {[
              { label: 'Format', value: book.format },
              { label: 'Pages', value: book.pages },
              { label: 'Language', value: book.language },
              { label: 'Publisher', value: book.publisher },
            ].filter(m => m.value).map(({ label, value }) => (
              <div key={label} className="bg-cream-100 px-3 py-2 rounded-lg">
                <span className="text-ink-muted">{label}: </span>
                <span className="text-ink font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Add to cart */}
          <div className="flex items-center gap-4">
            {/* Qty selector */}
            <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-11 text-ink-muted hover:bg-cream-100 transition-colors">−</button>
              <span className="w-10 text-center font-medium text-ink">{qty}</span>
              <button onClick={() => setQty(Math.min(book.stock, qty + 1))}
                      className="w-10 h-11 text-ink-muted hover:bg-cream-100 transition-colors">+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || book.stock === 0}
              className="btn-primary flex-1 max-w-xs"
            >
              <ShoppingCart size={18} />
              {book.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              onClick={handleWishlist}
              className={clsx('p-3 rounded-lg border transition-colors',
                wishlisted ? 'bg-red-50 border-red-300 text-red-500' : 'border-cream-300 text-ink-muted hover:border-brand-400'
              )}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {book.stock > 0 && book.stock <= 5 && (
            <p className="text-amber-600 text-sm mt-3 font-medium">
              ⚠️ Only {book.stock} left in stock!
            </p>
          )}

          {/* Free shipping notice */}
          {book.price >= 35 && (
            <p className="text-green-600 text-sm mt-2">✓ Qualifies for free shipping!</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold mb-6">
          Customer Reviews
          {book.numReviews > 0 && <span className="text-ink-muted text-lg font-normal ml-2">({book.numReviews})</span>}
        </h2>

        {book.reviews?.length === 0 && (
          <div className="text-center py-10 bg-cream-50 rounded-xl border border-cream-200">
            <BookOpen size={32} className="text-brand-300 mx-auto mb-3" />
            <p className="text-ink-muted">No reviews yet. Be the first!</p>
          </div>
        )}

        {book.reviews?.map((r) => (
          <div key={r._id} className="border-b border-cream-200 py-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center
                                text-brand-600 font-semibold text-sm">
                  {r.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-ink">{r.name}</span>
              </div>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13}
                        className={s <= r.rating ? 'text-amber-400' : 'text-cream-300'}
                        fill={s <= r.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
            <p className="text-ink text-sm leading-relaxed">{r.comment}</p>
            <p className="text-xs text-ink-muted mt-1">
              {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        ))}

        {/* Add review form */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="mt-8 card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="label">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                    <Star size={24}
                          className={s <= review.rating ? 'text-amber-400' : 'text-cream-300'}
                          fill={s <= review.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Your Review</label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))}
                className="input min-h-[100px] resize-none"
                placeholder="Share your thoughts about this book..."
                required
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn-primary">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

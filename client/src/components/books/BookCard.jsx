import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../context/cartStore';
import { wishlistApi } from '../../lib/api';
import { useAuthStore } from '../../context/authStore';
import { useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function BookCard({ book }) {
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    setAddingToCart(true);
    await addToCart(book._id);
    setAddingToCart(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to save to wishlist');
      return;
    }
    try {
      const { data } = await wishlistApi.toggle(book._id);
      setWishlisted(data.added);
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link
      to={`/books/${book._id}`}
      className="group card book-card-hover flex flex-col"
    >
      {/* Cover image */}
      <div className="relative overflow-hidden bg-cream-100 aspect-[2/3]">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/200x300/faf4e8/7a5c4a?text=${encodeURIComponent(book.title)}`;
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge bg-brand-500 text-white">-{discount}%</span>
          )}
          {book.bestseller && (
            <span className="badge bg-amber-500 text-white">Bestseller</span>
          )}
          {book.newArrival && (
            <span className="badge bg-emerald-500 text-white">New</span>
          )}
        </div>

        {/* Out of stock overlay */}
        {!book.inStock && book.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="badge bg-white/90 text-ink text-xs font-semibold px-3 py-1">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-all duration-300">
          <div className="absolute bottom-2 left-2 right-2 flex gap-2 translate-y-4 opacity-0
                          group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || book.stock === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-500
                         text-white text-xs font-medium rounded-lg hover:bg-brand-600
                         disabled:opacity-50 transition-colors shadow-warm"
            >
              <ShoppingCart size={13} />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={clsx(
                'p-2 rounded-lg transition-colors shadow-warm',
                wishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-ink-muted hover:text-red-500'
              )}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-brand-500 font-medium uppercase tracking-wide mb-1">
          {book.genre?.[0]}
        </p>
        <h3 className="font-display font-semibold text-ink text-sm leading-snug mb-1
                       line-clamp-2 group-hover:text-brand-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-ink-muted mb-3">{book.author}</p>

        {/* Rating */}
        {book.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={star <= Math.round(book.rating) ? 'text-amber-400' : 'text-cream-300'}
                  fill={star <= Math.round(book.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-ink-muted">({book.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <span className="font-display font-bold text-brand-600 text-lg">
            ${book.price.toFixed(2)}
          </span>
          {book.originalPrice && (
            <span className="text-xs text-ink-muted line-through">
              ${book.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { wishlistApi } from '../lib/api';
import { useCartStore } from '../context/cartStore';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    wishlistApi.get().then(({ data }) => { setWishlist(data.wishlist); setLoading(false); });
  }, []);

  const handleRemove = async (bookId) => {
    await wishlistApi.toggle(bookId);
    setWishlist(w => ({ ...w, books: w.books.filter(b => b.book._id !== bookId) }));
    toast.success('Removed from wishlist');
  };

  const books = wishlist?.books || [];

  if (loading) return <div className="page-container py-20 text-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-brand-500" fill="currentColor" />
        <h1 className="font-display text-3xl font-bold text-ink">My Wishlist</h1>
        <span className="text-ink-muted">({books.length} books)</span>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-brand-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl mb-3">Your wishlist is empty</h2>
          <p className="text-ink-muted mb-6">Save books you love to read later</p>
          <Link to="/books" className="btn-primary">Browse Books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map(({ book }) => book && (
            <div key={book._id} className="card group overflow-hidden">
              <Link to={`/books/${book._id}`} className="block aspect-[2/3] bg-cream-100 overflow-hidden">
                <img src={book.coverImage} alt={book.title}
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     onError={(e) => { e.target.src = `https://via.placeholder.com/200x300/faf4e8/7a5c4a?text=Book`; }} />
              </Link>
              <div className="p-4">
                <Link to={`/books/${book._id}`}>
                  <h3 className="font-display font-semibold text-ink hover:text-brand-500 transition-colors line-clamp-1">{book.title}</h3>
                </Link>
                <p className="text-sm text-ink-muted mb-3">{book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-brand-600">${book.price?.toFixed(2)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart(book._id)}
                            className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
                      <ShoppingCart size={15} />
                    </button>
                    <button onClick={() => handleRemove(book._id)}
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                      <Heart size={15} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

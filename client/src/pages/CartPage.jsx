import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.book?.price ?? 0) * i.quantity, 0);
  const shipping = subtotal >= 35 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!isAuthenticated) return (
    <div className="page-container py-20 text-center">
      <ShoppingBag size={48} className="text-brand-300 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-semibold mb-3">Your cart is waiting</h2>
      <p className="text-ink-muted mb-6">Sign in to view your cart and checkout</p>
      <div className="flex justify-center gap-3">
        <Link to="/login" className="btn-primary">Sign In</Link>
        <Link to="/books" className="btn-secondary">Browse Books</Link>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="page-container py-20 text-center">
      <ShoppingBag size={48} className="text-brand-300 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-semibold mb-3">Your cart is empty</h2>
      <p className="text-ink-muted mb-6">Add some books to get started!</p>
      <Link to="/books" className="btn-primary">Browse Books</Link>
    </div>
  );

  return (
    <div className="page-container py-10">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">
        Shopping Cart <span className="text-ink-muted text-xl font-normal">({items.length} items)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const book = item.book;
            if (!book) return null;
            return (
              <div key={item._id} className="card p-5 flex gap-4">
                <Link to={`/books/${book._id}`} className="flex-shrink-0">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded-lg shadow-warm-sm"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/64x96/faf4e8/7a5c4a?text=Book`; }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link to={`/books/${book._id}`}
                            className="font-display font-semibold text-ink hover:text-brand-500 transition-colors line-clamp-1">
                        {book.title}
                      </Link>
                      <p className="text-sm text-ink-muted">{book.author}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(book._id)}
                      className="text-ink-muted hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(book._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-ink-muted
                                   hover:bg-cream-100 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(book._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-ink-muted
                                   hover:bg-cream-100 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-display font-bold text-brand-600">
                        ${(book.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-ink-muted">${book.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link to="/books" className="flex items-center gap-2 text-sm text-brand-500
                                        hover:text-brand-600 font-medium transition-colors">
            ← Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="mt-3 p-2.5 bg-brand-50 rounded-lg text-xs text-brand-700">
                Add ${(35 - subtotal).toFixed(2)} more for free shipping!
              </div>
            )}

            <div className="border-t border-cream-200 mt-4 pt-4 flex justify-between">
              <span className="font-display font-semibold text-lg">Total</span>
              <span className="font-display font-bold text-xl text-brand-600">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-5 text-base py-3.5"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-ink-muted">
              <span>🔒 Secure checkout</span>
              <span>💳 All cards accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowRight } from 'lucide-react';
import { useCartStore } from '../context/cartStore';
import { checkoutApi } from '../lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US',
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.book?.price ?? 0) * i.quantity, 0);
  const shipping = subtotal >= 35 ? 0 : 4.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cartItems = items.map((i) => ({ bookId: i.book._id, quantity: i.quantity }));
      const { data } = await checkoutApi.createSession({
        items: cartItems,
        shippingAddress: address,
      });
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) =>
    setAddress((a) => ({ ...a, [field]: e.target.value }));

  return (
    <div className="page-container py-10">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <form onSubmit={handleCheckout} className="flex-1 space-y-6">
          {/* Shipping address */}
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold mb-5">Shipping Address</h2>
            <p className="text-sm text-ink-muted mb-4">
              Your address will be confirmed and updated during Stripe checkout.
              Fill in your details here as a pre-fill.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Jane Smith" required
                       value={address.name} onChange={handleChange('name')} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 1</label>
                <input className="input" placeholder="123 Bookworm Lane" required
                       value={address.line1} onChange={handleChange('line1')} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line 2 (optional)</label>
                <input className="input" placeholder="Apt 4B"
                       value={address.line2} onChange={handleChange('line2')} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" placeholder="New York" required
                       value={address.city} onChange={handleChange('city')} />
              </div>
              <div>
                <label className="label">State / Province</label>
                <input className="input" placeholder="NY"
                       value={address.state} onChange={handleChange('state')} />
              </div>
              <div>
                <label className="label">ZIP / Postal Code</label>
                <input className="input" placeholder="10001" required
                       value={address.postalCode} onChange={handleChange('postalCode')} />
              </div>
              <div>
                <label className="label">Country</label>
                <select className="input" value={address.country} onChange={handleChange('country')}>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment notice */}
          <div className="card p-6 bg-brand-50 border-brand-200">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard size={20} className="text-brand-500" />
              <h2 className="font-display text-xl font-semibold">Payment</h2>
            </div>
            <p className="text-sm text-ink-muted leading-relaxed">
              You'll be redirected to Stripe's secure checkout to enter your payment details.
              We accept Visa, Mastercard, American Express, and more.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-ink-muted">
              <Lock size={13} />
              <span>256-bit SSL encryption — your data is always secure</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base py-4"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                <Lock size={18} />
                Pay Securely with Stripe — ${total.toFixed(2)}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3">
                  <img
                    src={item.book?.coverImage}
                    alt={item.book?.title}
                    className="w-10 h-14 object-cover rounded shadow-warm-sm flex-shrink-0"
                    onError={(e) => { e.target.src = `https://via.placeholder.com/40x56/faf4e8/7a5c4a?text=Book`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink line-clamp-1">{item.book?.title}</p>
                    <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-brand-600 flex-shrink-0">
                    ${(item.book?.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Tax</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg pt-2
                              border-t border-cream-200 mt-2">
                <span>Total</span>
                <span className="text-brand-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

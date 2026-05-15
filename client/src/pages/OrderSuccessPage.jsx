import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { checkoutApi } from '../lib/api';
import { useCartStore } from '../context/cartStore';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
    if (sessionId) {
      checkoutApi.getSession(sessionId)
        .then(({ data }) => setOrder(data.order))
        .catch(() => {});
    }
  }, [sessionId]);

  return (
    <div className="page-container py-20 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h1 className="font-display text-3xl font-bold text-ink mb-3">Order Confirmed!</h1>
      <p className="text-ink-muted mb-2">Thank you for your purchase.</p>
      {order && (
        <p className="text-sm text-ink-muted mb-2">
          Order #{order._id?.slice(-8).toUpperCase()} · Total: <strong>${order.total?.toFixed(2)}</strong>
        </p>
      )}
      <p className="text-ink-muted mb-8">You'll receive a confirmation email with shipping details.</p>
      <div className="flex justify-center gap-4">
        <Link to="/orders" className="btn-primary"><Package size={18} /> View Orders</Link>
        <Link to="/books" className="btn-secondary">Keep Shopping</Link>
      </div>
    </div>
  );
}

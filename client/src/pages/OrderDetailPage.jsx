import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft,
  MapPin, CreditCard, RefreshCw, AlertCircle, ChevronRight,
} from 'lucide-react';
import api from '../lib/api';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Order Placed',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-400',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    dot: 'bg-blue-400',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    dot: 'bg-indigo-400',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700 bg-green-50 border-green-200',
    dot: 'bg-green-500',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700 bg-red-50 border-red-200',
    dot: 'bg-red-400',
    icon: XCircle,
  },
  refunded: {
    label: 'Refunded',
    color: 'text-stone-700 bg-stone-100 border-stone-200',
    dot: 'bg-stone-400',
    icon: RefreshCw,
  },
};

// ── Progress steps (happy path) ───────────────────────────────────────────────
const PROGRESS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, desc: 'We received your order' },
  { key: 'processing', label: 'Processing', icon: Package, desc: 'Picking & packing your books' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'On its way to you' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Enjoy your books!' },
];
const STEP_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

function getStepState(stepKey, orderStatus) {
  if (['cancelled', 'refunded'].includes(orderStatus)) return 'cancelled';
  const stepIndex = STEP_ORDER.indexOf(stepKey);
  const currentIndex = STEP_ORDER.indexOf(orderStatus);
  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'upcoming';
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((r) => setOrder(r.data.order))
      .catch(() => setError("Order not found or you don't have access."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`, { reason: 'Cancelled by customer.' });
      setOrder(data.order);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All Orders
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-warm p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="font-playfair text-2xl font-bold text-stone-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-stone-500 text-sm mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.color} self-start`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Progress tracker (happy path only) */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-warm p-6 mb-4">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-6">
              Order Progress
            </h2>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-100" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-brand-500 transition-all duration-500"
                style={{
                  width: `${(STEP_ORDER.indexOf(order.status) / (STEP_ORDER.length - 1)) * 100}%`,
                }}
              />

              <div className="relative flex justify-between">
                {PROGRESS_STEPS.map((step) => {
                  const state = getStepState(step.key, order.status);
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all ${
                          state === 'done'
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : state === 'active'
                            ? 'bg-white border-brand-500 text-brand-500'
                            : 'bg-white border-stone-200 text-stone-300'
                        }`}
                      >
                        {state === 'done' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-semibold ${
                          state === 'done' || state === 'active' ? 'text-stone-800' : 'text-stone-400'
                        }`}>{step.label}</p>
                        <p className="text-xs text-stone-400 hidden sm:block">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking info */}
            {order.trackingNumber && (
              <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Carrier</p>
                  <p className="font-semibold text-stone-800">{order.carrier || '—'}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="font-mono font-semibold text-brand-600">{order.trackingNumber}</p>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex-1">
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Est. Delivery</p>
                    <p className="font-semibold text-stone-800">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {order.timeline?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-warm p-6 mb-4">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-5">
              Activity Log
            </h2>
            <div className="space-y-0">
              {[...order.timeline].reverse().map((entry, i) => {
                const entryCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                return (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Vertical line */}
                    {i < order.timeline.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-px bg-stone-100" />
                    )}
                    {/* Dot */}
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${entryCfg.dot}`}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-stone-800 capitalize">
                          {entryCfg.label}
                        </p>
                        <time className="text-xs text-stone-400 flex-shrink-0">
                          {new Date(entry.timestamp).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </time>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-stone-500 mt-0.5">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl shadow-warm p-6 mb-4">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-5">
            Items ({order.items.length})
          </h2>
          <div className="divide-y divide-stone-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-14 h-20 object-cover rounded-lg flex-shrink-0 bg-stone-100"
                  />
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-brand-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/books/${item.book?.slug || item.book}`}
                    className="font-semibold text-stone-900 hover:text-brand-600 transition-colors line-clamp-2 text-sm leading-snug"
                  >
                    {item.title}
                  </Link>
                  <p className="text-stone-500 text-xs mt-0.5">{item.author}</p>
                  <p className="text-stone-400 text-xs mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-stone-900 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-stone-400 text-xs">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-stone-100 pt-4 mt-2 space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Shipping</span>
              {order.shipping > 0
                ? <span>${order.shipping.toFixed(2)}</span>
                : <span className="text-green-600">Free</span>
              }
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
              <span>Total</span><span className="text-brand-600">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping + Payment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-warm p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </div>
            <address className="not-italic text-sm text-stone-700 leading-relaxed">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
              {order.shippingAddress.country}
            </address>
          </div>
          <div className="bg-white rounded-2xl shadow-warm p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              <CreditCard className="w-4 h-4" />
              Payment
            </div>
            <p className="text-sm text-stone-700 capitalize">{order.paymentMethod || 'Card'}</p>
            <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
              order.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-700'
                : order.paymentStatus === 'refunded'
                ? 'bg-stone-100 text-stone-600'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
            </span>
            {order.paidAt && (
              <p className="text-xs text-stone-400 mt-2">
                Paid {new Date(order.paidAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <div className="bg-white rounded-2xl shadow-warm p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-800">Need to cancel?</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Orders can be cancelled before they ship. A full refund will be issued.
                </p>
              </div>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex-shrink-0 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Loading order…</p>
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-warm p-8 text-center max-w-sm">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="font-playfair text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">{message}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-brand-500 hover:text-brand-600 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
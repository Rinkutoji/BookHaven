import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  RefreshCw, MapPin, CreditCard, User, Edit3, Save, X, Loader2,
} from 'lucide-react';
import api from '../../lib/api';
import AdminOrderStatusModal from '../../components/admin/AdminOrderStatusModal';

const STATUS_STYLES = {
  pending:    'bg-amber-50  text-amber-700  border-amber-200',
  processing: 'bg-blue-50   text-blue-700   border-blue-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50  text-green-700  border-green-200',
  cancelled:  'bg-red-50    text-red-700    border-red-200',
  refunded:   'bg-stone-100 text-stone-600  border-stone-200',
};

const STATUS_ICONS = { pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: XCircle, refunded: RefreshCw };

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [statusModal, setStatusModal] = useState(false);

  // Admin note editing
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue]     = useState('');
  const [savingNote, setSavingNote]   = useState(false);

  useEffect(() => {
    api.get(`/orders/admin/${id}`)
      .then(r => { setOrder(r.data.order); setNoteValue(r.data.order.adminNote || ''); })
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const { data } = await api.patch(`/orders/admin/${id}/note`, { adminNote: noteValue });
      setOrder(data.order);
      setEditingNote(false);
    } catch {}
    finally { setSavingNote(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-stone-500 mb-4">{error || 'Order not found.'}</p>
        <Link to="/admin/orders" className="text-brand-500 hover:text-brand-600 font-medium text-sm">← Back to Orders</Link>
      </div>
    </div>
  );

  const cfg = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
  const Icon = STATUS_ICONS[order.status] || Clock;
  const canUpdate = !['delivered', 'refunded'].includes(order.status);

  return (
    <div className="min-h-screen bg-cream-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back + Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand-500 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Order Management
            </Link>
            <h1 className="font-playfair text-2xl font-bold text-stone-900">#{order.orderNumber}</h1>
            <p className="text-stone-400 text-sm mt-0.5">
              Placed {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg}`}>
              <Icon className="w-3.5 h-3.5" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {canUpdate && (
              <button
                onClick={() => setStatusModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Update Status
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left column: Items + Timeline */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-warm p-6">
              <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">
                Items ({order.items.length})
              </h2>
              <div className="divide-y divide-stone-100">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 py-3.5 first:pt-0 last:pb-0">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt={item.title} className="w-12 h-16 object-cover rounded-lg bg-stone-100 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-16 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-brand-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-900 text-sm leading-snug">{item.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{item.author}</p>
                      <p className="text-xs text-stone-400 mt-1">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-semibold text-stone-900 flex-shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-stone-100 pt-4 mt-2 space-y-1.5">
                <Row label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'Free'} valueClass={order.shipping === 0 ? 'text-green-600' : ''} />
                {order.discount > 0 && (
                  <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`-$${order.discount.toFixed(2)}`} valueClass="text-green-600" />
                )}
                {order.tax > 0 && <Row label="Tax" value={`$${order.tax.toFixed(2)}`} />}
                <div className="flex justify-between font-bold text-stone-900 text-base pt-2 border-t border-stone-100">
                  <span>Total</span><span className="text-brand-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {order.timeline?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-warm p-6">
                <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-5">
                  Activity Timeline
                </h2>
                <div className="space-y-0">
                  {[...order.timeline].reverse().map((entry, i) => {
                    const EntryIcon = STATUS_ICONS[entry.status] || Clock;
                    return (
                      <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
                        {i < order.timeline.length - 1 && (
                          <div className="absolute left-3 top-6 bottom-0 w-px bg-stone-100" />
                        )}
                        <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <EntryIcon className="w-3 h-3 text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-stone-800 capitalize">{entry.status}</p>
                            <time className="text-xs text-stone-400">
                              {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </time>
                          </div>
                          {entry.note && <p className="text-sm text-stone-500 mt-0.5">{entry.note}</p>}
                          {entry.updatedBy?.name && (
                            <p className="text-xs text-stone-300 mt-0.5">by {entry.updatedBy.name}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Customer + Shipping + Payment + Admin Note */}
          <div className="space-y-4">

            {/* Customer */}
            <div className="bg-white rounded-2xl shadow-warm p-5">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer
              </h2>
              <p className="font-medium text-stone-900 text-sm">{order.user?.name || 'Guest'}</p>
              <p className="text-stone-500 text-sm">{order.user?.email || order.guestEmail || '—'}</p>
              {order.user?.phone && <p className="text-stone-400 text-xs mt-1">{order.user.phone}</p>}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-warm p-5">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Ship To
              </h2>
              <address className="not-italic text-sm text-stone-700 leading-relaxed">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                {order.shippingAddress.country}
              </address>
            </div>

            {/* Tracking */}
            {(order.trackingNumber || order.carrier) && (
              <div className="bg-white rounded-2xl shadow-warm p-5">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Tracking
                </h2>
                {order.carrier && <p className="text-xs text-stone-400">Carrier: <span className="text-stone-700 font-medium">{order.carrier}</span></p>}
                {order.trackingNumber && <p className="text-sm font-mono font-semibold text-brand-600 mt-1">{order.trackingNumber}</p>}
                {order.estimatedDelivery && (
                  <p className="text-xs text-stone-400 mt-1">
                    Est. {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-warm p-5">
              <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payment
              </h2>
              <div className="space-y-1.5">
                <Row label="Method" value={order.paymentMethod || 'Stripe'} small />
                <Row label="Status" value={
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    order.paymentStatus === 'refunded' ? 'bg-stone-100 text-stone-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>{order.paymentStatus}</span>
                } small />
                {order.paidAt && <Row label="Paid at" value={new Date(order.paidAt).toLocaleDateString()} small />}
              </div>
            </div>

            {/* Admin Note */}
            <div className="bg-white rounded-2xl shadow-warm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Admin Note
                </h2>
                {!editingNote ? (
                  <button onClick={() => setEditingNote(true)} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    {order.adminNote ? 'Edit' : '+ Add'}
                  </button>
                ) : (
                  <button onClick={() => { setEditingNote(false); setNoteValue(order.adminNote || ''); }} className="text-xs text-stone-400 hover:text-stone-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {editingNote ? (
                <div>
                  <textarea
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    rows={3}
                    placeholder="Internal note (not visible to customer)…"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-400 outline-none resize-none"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    {savingNote ? 'Saving…' : 'Save Note'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-stone-500 italic">
                  {order.adminNote || 'No internal note added.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {statusModal && (
        <AdminOrderStatusModal
          order={order}
          onClose={() => setStatusModal(false)}
          onUpdated={(updated) => { setOrder(updated); setStatusModal(false); }}
        />
      )}
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function Row({ label, value, valueClass = '', small = false }) {
  return (
    <div className={`flex justify-between ${small ? 'text-xs' : 'text-sm'}`}>
      <span className="text-stone-400">{label}</span>
      <span className={`font-medium text-stone-700 ${valueClass}`}>{value}</span>
    </div>
  );
}
import { useState } from 'react';
import { X, Truck, CheckCircle, Package, XCircle, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

// ── Valid transitions ─────────────────────────────────────────────────────────
const TRANSITIONS = {
  pending:    ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  [],
  cancelled:  ['refunded'],
  refunded:   [],
};

const STATUS_META = {
  processing: { label: 'Mark as Processing', icon: Package,       color: 'bg-blue-500 hover:bg-blue-600',    desc: 'Start preparing the order.' },
  shipped:    { label: 'Mark as Shipped',    icon: Truck,         color: 'bg-indigo-500 hover:bg-indigo-600',desc: 'The order has left your facility.' },
  delivered:  { label: 'Mark as Delivered',  icon: CheckCircle,   color: 'bg-green-500 hover:bg-green-600',  desc: 'Confirm delivery to customer.' },
  cancelled:  { label: 'Cancel Order',       icon: XCircle,       color: 'bg-red-500 hover:bg-red-600',      desc: 'Cancel and notify the customer.' },
  refunded:   { label: 'Mark as Refunded',   icon: RefreshCw,     color: 'bg-stone-500 hover:bg-stone-600',  desc: 'Confirm refund was issued.' },
};

export default function AdminOrderStatusModal({ order, onClose, onUpdated }) {
  const available = TRANSITIONS[order.status] || [];

  const [targetStatus, setTargetStatus] = useState(available[0] || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery ? order.estimatedDelivery.slice(0, 10) : ''
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const meta = STATUS_META[targetStatus];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.patch(`/orders/admin/${order._id}/status`, {
        status: targetStatus,
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
        note: note || undefined,
      });
      onUpdated(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-playfair text-lg font-bold text-stone-900">Update Order Status</h2>
            <p className="text-sm text-stone-400 mt-0.5">#{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">

            {/* Current status */}
            <div className="bg-stone-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-stone-500">Current status</span>
              <span className="text-sm font-semibold text-stone-800 capitalize">{order.status}</span>
            </div>

            {available.length === 0 ? (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  This order is <strong>{order.status}</strong> and cannot be updated further.
                </p>
              </div>
            ) : (
              <>
                {/* Target status selector */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    New Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {available.map((s) => {
                      const m = STATUS_META[s];
                      const Icon = m.icon;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setTargetStatus(s)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                            targetStatus === s
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-stone-200 hover:border-stone-300 text-stone-600'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <div>
                            <p className="font-semibold capitalize">{s}</p>
                            <p className="text-xs text-stone-400 font-normal leading-tight">{m.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping fields — only when marking as shipped */}
                {targetStatus === 'shipped' && (
                  <div className="space-y-3 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Shipping Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Carrier
                        </label>
                        <select
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-400 outline-none"
                        >
                          <option value="">Select carrier</option>
                          {['UPS', 'FedEx', 'USPS', 'DHL', 'Amazon Logistics', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. 1Z999AA1…"
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-400 outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Estimated Delivery
                      </label>
                      <input
                        type="date"
                        value={estimatedDelivery}
                        onChange={(e) => setEstimatedDelivery(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-brand-400 outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Note <span className="text-stone-400 font-normal">(optional, sent to customer)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      targetStatus === 'cancelled'
                        ? 'Reason for cancellation…'
                        : 'Internal or customer-facing note…'
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition-all resize-none"
                  />
                </div>

                {/* Email notice */}
                {['shipped', 'delivered', 'cancelled'].includes(targetStatus) && (
                  <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                    <span>📧</span>
                    <span>
                      A <strong>{targetStatus}</strong> email notification will be sent to{' '}
                      <strong>{order.user?.email || 'the customer'}</strong>.
                    </span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            {available.length > 0 && (
              <button
                type="submit"
                disabled={loading || !targetStatus}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${meta?.color || 'bg-brand-500 hover:bg-brand-600'}`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Updating…' : (meta?.label || 'Update')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
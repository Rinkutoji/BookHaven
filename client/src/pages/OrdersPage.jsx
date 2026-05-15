import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '../lib/api';
import clsx from 'clsx';

const STATUS_COLORS = {
  pending:    'bg-amber-100 text-amber-700',
  paid:       'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.my().then(({ data }) => { setOrders(data.orders); setLoading(false); });
  }, []);

  if (loading) return <div className="page-container py-20 text-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-3 mb-8">
        <Package size={28} className="text-brand-500" />
        <h1 className="font-display text-3xl font-bold text-ink">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-brand-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl mb-3">No orders yet</h2>
          <p className="text-ink-muted mb-6">Start shopping to see your orders here</p>
          <Link to="/books" className="btn-primary">Browse Books</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-ink text-sm font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                    <span className={clsx('badge capitalize', STATUS_COLORS[order.status] || 'bg-cream-100 text-ink-muted')}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' · '}{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold text-xl text-brand-600">${order.total?.toFixed(2)}</span>
                  <Link to={`/orders/${order._id}`} className="btn-secondary text-sm py-2">
                    Details <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
              {/* Item previews */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {order.items?.slice(0, 5).map((item) => (
                  <img key={item._id} src={item.coverImage} alt={item.title}
                       className="w-10 h-14 object-cover rounded shadow-warm-sm flex-shrink-0"
                       onError={(e) => { e.target.src = `https://via.placeholder.com/40x56/faf4e8/7a5c4a?text=Book`; }} />
                ))}
                {order.items?.length > 5 && (
                  <div className="w-10 h-14 bg-cream-100 rounded flex items-center justify-center text-xs text-ink-muted flex-shrink-0">
                    +{order.items.length - 5}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

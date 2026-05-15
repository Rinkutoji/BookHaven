import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, XCircle, RefreshCw,
  Search, Filter, ChevronLeft, ChevronRight, TrendingUp,
  DollarSign, ShoppingBag, AlertCircle, Eye, Edit3, X,
} from 'lucide-react';
import api from '../../lib/api';
import AdminOrderStatusModal from '../../components/admin/AdminOrderStatusModal';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES = {
  pending:    'bg-amber-50  text-amber-700  border border-amber-200',
  processing: 'bg-blue-50   text-blue-700   border border-blue-200',
  shipped:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered:  'bg-green-50  text-green-700  border border-green-200',
  cancelled:  'bg-red-50    text-red-700    border border-red-200',
  refunded:   'bg-stone-100 text-stone-600  border border-stone-200',
};

const STATUS_ICONS = {
  pending:    Clock,
  processing: Package,
  shipped:    Truck,
  delivered:  CheckCircle,
  cancelled:  XCircle,
  refunded:   RefreshCw,
};

export default function AdminOrdersPage() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [orders, setOrders]         = useState([]);
  const [stats, setStats]           = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeTab, setActiveTab]   = useState('all');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage]             = useState(1);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal]     = useState(false);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/orders/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Fetch orders ─────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(activeTab !== 'all' && { status: activeTab }),
        ...(search && { search }),
      });
      const { data } = await api.get(`/orders/admin/list?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Reset page on tab/search change
  useEffect(() => { setPage(1); }, [activeTab, search]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusModal(true);
  };

  const handleStatusUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    setStatusModal(false);
    // Refresh stats
    api.get('/orders/admin/stats').then(r => setStats(r.data)).catch(() => {});
  };

  // ── Stat cards data ───────────────────────────────────────────────────────
  const statCards = stats ? [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `$${stats.monthRevenue?.toFixed(2)} this month`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders?.toLocaleString(),
      sub: `+${stats.monthOrders} this month`,
      icon: ShoppingBag,
      color: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Pending',
      value: stats.statusBreakdown?.pending || 0,
      sub: 'Awaiting processing',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Shipped',
      value: stats.statusBreakdown?.shipped || 0,
      sub: 'In transit',
      icon: Truck,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-stone-900">Order Management</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {pagination.total.toLocaleString()} orders total
            </p>
          </div>
          <Link
            to="/admin"
            className="text-sm text-stone-500 hover:text-brand-500 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stat Cards */}
        {!statsLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl shadow-warm p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold text-stone-900">{card.value}</p>
                      <p className="text-xs text-stone-400 mt-1">{card.sub}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-warm p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by order # or book title…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition-all"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {tab.label}
                {stats?.statusBreakdown?.[tab.key] != null && tab.key !== 'all' && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {stats.statusBreakdown[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : orders.length === 0 ? (
            <EmptyState search={search} activeTab={activeTab} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {orders.map((order) => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        onEdit={openStatusModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-stone-100">
                {orders.map((order) => (
                  <MobileOrderCard
                    key={order._id}
                    order={order}
                    onEdit={openStatusModal}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-5 py-4 border-t border-stone-100 flex items-center justify-between">
                  <p className="text-sm text-stone-500">
                    Page {pagination.page} of {pagination.pages} · {pagination.total} orders
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-stone-200 disabled:opacity-40 hover:border-brand-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page >= pagination.pages}
                      className="p-2 rounded-lg border border-stone-200 disabled:opacity-40 hover:border-brand-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top Books */}
        {stats?.topBooks?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-warm p-6">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Selling Books
            </h2>
            <div className="space-y-3">
              {stats.topBooks.map((book, i) => (
                <div key={book._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-300 w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{book._id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-stone-900">${book.revenue.toFixed(2)}</p>
                    <p className="text-xs text-stone-400">{book.sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && selectedOrder && (
        <AdminOrderStatusModal
          order={selectedOrder}
          onClose={() => setStatusModal(false)}
          onUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onEdit }) {
  const Icon = STATUS_ICONS[order.status] || Clock;
  return (
    <tr className="hover:bg-stone-50/60 transition-colors">
      <td className="px-5 py-4">
        <p className="font-mono text-sm font-semibold text-stone-900">#{order.orderNumber}</p>
        {order.stripeSessionId && (
          <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[120px]">
            {order.stripeSessionId.slice(0, 16)}…
          </p>
        )}
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-stone-800">{order.user?.name || 'Guest'}</p>
        <p className="text-xs text-stone-400">{order.user?.email || order.guestEmail || '—'}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-stone-700">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
        <p className="text-xs text-stone-400 truncate max-w-[120px]">
          {order.items[0]?.title}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
        </p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-stone-900">${order.total.toFixed(2)}</p>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
          <Icon className="w-3 h-3" />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-stone-600">
          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/orders/${order._id}`}
            className="p-1.5 rounded-lg text-stone-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {!['delivered', 'refunded'].includes(order.status) && (
            <button
              onClick={() => onEdit(order)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
              title="Update status"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function MobileOrderCard({ order, onEdit }) {
  const Icon = STATUS_ICONS[order.status] || Clock;
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-stone-900">#{order.orderNumber}</p>
          <p className="text-xs text-stone-400 mt-0.5">{order.user?.name || 'Guest'}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
          <Icon className="w-3 h-3" />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        <span className="font-bold text-stone-900">${order.total.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Link
            to={`/admin/orders/${order._id}`}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium"
          >
            View
          </Link>
          {!['delivered', 'refunded'].includes(order.status) && (
            <button
              onClick={() => onEdit(order)}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 bg-stone-100 rounded w-24" />
          <div className="h-4 bg-stone-100 rounded w-32" />
          <div className="h-4 bg-stone-100 rounded w-20" />
          <div className="h-4 bg-stone-100 rounded w-16" />
          <div className="h-4 bg-stone-100 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────
function EmptyState({ search, activeTab }) {
  return (
    <div className="py-16 text-center">
      <ShoppingBag className="w-12 h-12 text-stone-200 mx-auto mb-4" />
      <p className="font-semibold text-stone-500">No orders found</p>
      <p className="text-stone-400 text-sm mt-1">
        {search ? `No results for "${search}"` : `No ${activeTab !== 'all' ? activeTab : ''} orders yet`}
      </p>
    </div>
  );
}
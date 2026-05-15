const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_FLOW = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

const isValidTransition = (from, to) => STATUS_FLOW[from]?.includes(to);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  (user's own orders)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('items.book', 'title coverImage slug'),
      Order.countDocuments(filter),
    ]);

    return res.json({
      orders,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  (user's own order)
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.book',
      'title coverImage slug author'
    );

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Users can only see their own; admins can see any
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.json({ order });
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ message: 'Failed to fetch order.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders  (create from Stripe webhook / checkout)
// ─────────────────────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, shipping, tax, discount, total,
            couponCode, stripeSessionId, stripePaymentIntentId, paymentStatus, guestEmail } = req.body;

    if (!items?.length || !shippingAddress || !total) {
      return res.status(400).json({ message: 'Items, shipping address, and total are required.' });
    }

    const order = await Order.create({
      user: req.user._id,
      guestEmail,
      items,
      shippingAddress,
      subtotal,
      shipping: shipping || 0,
      tax: tax || 0,
      discount: discount || 0,
      total,
      couponCode,
      stripeSessionId,
      stripePaymentIntentId,
      paymentStatus: paymentStatus || 'paid',
      paidAt: paymentStatus === 'paid' ? new Date() : undefined,
      status: 'pending',
      timeline: [{ status: 'pending', note: 'Order placed successfully.' }],
    });

    // Send order confirmation email
    const populatedOrder = await Order.findById(order._id);
    const emailTo = req.user.email || guestEmail;
    if (emailTo) {
      await sendEmail({
        to: emailTo,
        template: 'orderConfirmation',
        data: { name: req.user.name || 'Valued Customer', order: populatedOrder },
      });
    }

    return res.status(201).json({ order });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ message: 'Failed to create order.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/cancel  (user cancels own pending order)
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (!isValidTransition(order.status, 'cancelled')) {
      return res.status(400).json({
        message: `Cannot cancel an order that is already ${order.status}.`,
      });
    }

    const reason = req.body.reason || 'Cancelled by customer.';
    order.addTimelineEntry({ status: 'cancelled', note: reason, updatedBy: req.user._id });
    order.cancellationReason = reason;
    await order.save();

    // Email
    await sendEmail({
      to: order.user.email,
      template: 'orderCancelled',
      data: { name: order.user.name, order, reason },
    });

    return res.json({ message: 'Order cancelled successfully.', order });
  } catch (err) {
    console.error('cancelOrder error:', err);
    return res.status(500).json({ message: 'Failed to cancel order.' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders  — all orders with filters + pagination
// ─────────────────────────────────────────────────────────────────────────────
exports.adminGetOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortDir = 'desc',
      from,
      to,
    } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.title': { $regex: search, $options: 'i' } },
      ];
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name email'),
      Order.countDocuments(filter),
    ]);

    // Summary stats
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);

    return res.json({
      orders,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
      },
      stats,
    });
  } catch (err) {
    console.error('adminGetOrders error:', err);
    return res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders/:id  — single order detail
// ─────────────────────────────────────────────────────────────────────────────
exports.adminGetOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('timeline.updatedBy', 'name');

    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch order.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/status  — update order status
// ─────────────────────────────────────────────────────────────────────────────
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier, estimatedDelivery } = req.body;

    if (!status) return res.status(400).json({ message: 'Status is required.' });

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (!isValidTransition(order.status, status)) {
      return res.status(400).json({
        message: `Cannot transition from "${order.status}" to "${status}".`,
        allowedTransitions: STATUS_FLOW[order.status],
      });
    }

    // Apply fields
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    const timelineNote = note || buildDefaultNote(status, { trackingNumber, carrier });
    order.addTimelineEntry({ status, note: timelineNote, updatedBy: req.user._id });
    await order.save();

    // ── Send email based on new status ────────────────────────────────────────
    const { email, name } = order.user;
    if (status === 'shipped') {
      await sendEmail({
        to: email,
        template: 'orderShipped',
        data: { name, order, trackingNumber, carrier },
      });
    } else if (status === 'delivered') {
      await sendEmail({
        to: email,
        template: 'orderDelivered',
        data: { name, order },
      });
    } else if (status === 'cancelled') {
      await sendEmail({
        to: email,
        template: 'orderCancelled',
        data: { name, order, reason: note },
      });
    }

    return res.json({
      message: `Order status updated to "${status}".`,
      order,
    });
  } catch (err) {
    console.error('adminUpdateOrderStatus error:', err);
    return res.status(500).json({ message: 'Failed to update order status.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/note  — update admin note
// ─────────────────────────────────────────────────────────────────────────────
exports.adminUpdateOrderNote = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNote },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.json({ message: 'Note updated.', order });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update note.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders/stats  — dashboard metrics
// ─────────────────────────────────────────────────────────────────────────────
exports.adminGetOrderStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      monthOrders,
      lastMonthOrders,
      revenueAgg,
      monthRevenueAgg,
      statusBreakdown,
      recentOrders,
      topBooks,
    ] = await Promise.all([
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.find({ paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.title', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, sold: { $sum: '$items.quantity' } } },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const monthRevenue = monthRevenueAgg[0]?.total || 0;
    const orderGrowth = lastMonthOrders > 0
      ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
      : 100;

    return res.json({
      totalOrders,
      monthOrders,
      orderGrowth: Number(orderGrowth),
      totalRevenue,
      monthRevenue,
      statusBreakdown: Object.fromEntries(statusBreakdown.map((s) => [s._id, s.count])),
      recentOrders,
      topBooks,
    });
  } catch (err) {
    console.error('adminGetOrderStats error:', err);
    return res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// ── Internal helper ───────────────────────────────────────────────────────────
function buildDefaultNote(status, { trackingNumber, carrier } = {}) {
  const notes = {
    processing: 'Order is being packed.',
    shipped: trackingNumber
      ? `Shipped via ${carrier || 'carrier'}. Tracking: ${trackingNumber}`
      : 'Order has been shipped.',
    delivered: 'Order delivered to customer.',
    cancelled: 'Order cancelled by admin.',
    refunded: 'Refund issued.',
  };
  return notes[status] || `Status changed to ${status}.`;
}
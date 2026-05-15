const mongoose = require('mongoose');

// ── Subdocument schemas ───────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'US' },
  },
  { _id: false }
);

// Status timeline entry — one entry per status change
const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    note: String,         // e.g. "Tracking: 1Z999AA10123456784"
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Auto-incrementing friendly order number (e.g. BH-10042)
    orderNumber: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guestEmail: String, // for guest checkouts

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'Order must contain at least one item'],
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,

    // ── Status & Timeline ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },

    // ── Shipping ──────────────────────────────────────────────────────────────
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    trackingNumber: String,
    carrier: String, // e.g. 'UPS', 'FedEx', 'USPS'
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,

    // ── Payment ───────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'card', 'paypal'],
      default: 'stripe',
    },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: String,
    paidAt: Date,

    // ── Admin notes ───────────────────────────────────────────────────────────
    adminNote: String,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ stripeSessionId: 1 });

// ── Auto-generate order number ────────────────────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `BH-${String(10000 + count + 1)}`;
  }
  next();
});

// ── Add timeline entry on status change ───────────────────────────────────────
orderSchema.methods.addTimelineEntry = function ({ status, note, updatedBy }) {
  this.status = status;
  this.timeline.push({ status, note, updatedBy, timestamp: new Date() });

  // Set denormalized timestamps
  if (status === 'shipped') this.shippedAt = new Date();
  if (status === 'delivered') this.deliveredAt = new Date();
};

// ── Virtual: isEditable (admin can still update) ──────────────────────────────
orderSchema.virtual('isEditable').get(function () {
  return !['delivered', 'cancelled', 'refunded'].includes(this.status);
});

module.exports = mongoose.model('Order', orderSchema);
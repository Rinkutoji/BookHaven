const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: 'text',
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number, // For showing discounts
      default: null,
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    tags: [String],
    publisher: String,
    publishedDate: Date,
    pages: Number,
    language: { type: String, default: 'English' },
    format: {
      type: String,
      enum: ['Hardcover', 'Paperback', 'Ebook', 'Audiobook'],
      default: 'Paperback',
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    stripeProductId: String,
    stripePriceId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });

// Recalculate rating after review changes
bookSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Virtual: discount percentage
bookSchema.virtual('discountPercent').get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Virtual: in stock
bookSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

module.exports = mongoose.model('Book', bookSchema);

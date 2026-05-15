require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes       = require('./routes/auth');
const bookRoutes       = require('./routes/books');
const userRoutes       = require('./routes/users');
const cartRoutes       = require('./routes/cart');
const wishlistRoutes   = require('./routes/wishlist');
const orderRoutes      = require('./routes/orders');
const checkoutRoutes   = require('./routes/checkout');
const searchRoutes     = require('./routes/search');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// ── CORS fix សម្រាប់ Production (Vercel + localhost) ──────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stripe webhook needs raw body — must come BEFORE express.json()
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/books',      bookRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/checkout',   checkoutRoutes);
app.use('/api/search',     searchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BookHaven server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
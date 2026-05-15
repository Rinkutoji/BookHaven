const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT access token ───────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Auth check failed.' });
  }
};

// ── Require admin role ────────────────────────────────────────────────────────
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

// ── Optional auth (attach user if token present, don't fail) ──────────────────
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // Ignore errors — optional auth
  }
  next();
};
// ── Alias (backward compatibility with existing routes) ───────────────────────
exports.adminOnly = exports.requireAdmin;
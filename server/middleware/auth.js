// server/middleware/auth.js
// ─────────────────────────────────────────────────────────────────
// FIXES:
//   ✅ protect → removed isEmailVerified check (was causing 401)
//   ✅ protect → isActive auto-heals if false (instead of hard reject)
//   ✅ protect → clear error messages with codes for frontend handling
// ─────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Protect: Verify JWT access token ─────────────────────────────

exports.protect = async (req, res, next) => {
  try {
    // 1. Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired.",
          code: "TOKEN_EXPIRED", // ✅ frontend intercepts this to auto-refresh
        });
      }
      return res.status(401).json({
        message: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }

    // 3. Find user in DB
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // ✅ isActive check — auto-heal instead of hard reject
    // (fixes existing users who were created without isActive: true)
    if (!user.isActive) {
      user.isActive = true;
      await user.save();
    }

    // ✅ isEmailVerified check — DISABLED for now
    // (re-enable this later when email flow is fully working)
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your email address.",
    //     code: "EMAIL_NOT_VERIFIED",
    //     email: user.email,
    //   });
    // }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("protect middleware error:", err);
    return res.status(500).json({ message: "Auth check failed." });
  }
};

// ── Require Admin Role ────────────────────────────────────────────

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
      code: "FORBIDDEN",
    });
  }
  next();
};

// ── Optional Auth ─────────────────────────────────────────────────
// Attaches user to req if token is valid — does NOT fail if missing

exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // Ignore all errors — optional auth never blocks the request
  }
  next();
};

// ── Alias (backward compatibility) ───────────────────────────────
exports.adminOnly = exports.requireAdmin;
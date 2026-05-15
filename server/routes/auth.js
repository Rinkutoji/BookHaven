// server/routes/auth.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,          // ← NEW
  resendVerification,   // ← NEW
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// ── Public ────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ── Email verification  ← NEW ─────────────────────────────────────
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

// ── Protected ─────────────────────────────────────────────────────
router.get("/me", protect, getMe);

module.exports = router;
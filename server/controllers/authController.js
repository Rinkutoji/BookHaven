// server/controllers/authController.js
// ─────────────────────────────────────────────────────────────────
// FIXES:
//   ✅ register → isEmailVerified: true, isActive: true (skip verification)
//   ✅ login    → no email-verification gate (commented out)
//   ✅ protect  → works with isActive check (users now have isActive: true)
//   ✅ refresh  → auto-refresh accessToken using refreshToken cookie
// ─────────────────────────────────────────────────────────────────

const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const emailService = require("../utils/emailService");

// ── Helpers ───────────────────────────────────────────────────────

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const setRefreshCookie = (res, token) =>
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // ✅ "none" for cross-origin (Vercel → Render)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

// ── Register ──────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check duplicate email
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // ✅ Create user — skip email verification for now
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true, // ✅ skip verification
      isActive: true,        // ✅ fix 401 on protect middleware
    });

    // ✅ Return accessToken immediately so user can log in right away
    const accessToken = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      message: "Registration successful!",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ── Login ─────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // ✅ Email verification gate — DISABLED for now
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your email before logging in.",
    //     code: "EMAIL_NOT_VERIFIED",
    //     email: user.email,
    //   });
    // }

    // ✅ Ensure isActive is true (fix for existing users)
    if (!user.isActive) {
      user.isActive = true;
    }

    const accessToken = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ── Refresh Token ─────────────────────────────────────────────────

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Refresh token expired or invalid." });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newAccess = signAccess(user._id);
    const newRefresh = signRefresh(user._id);

    user.refreshToken = newRefresh;
    await user.save();

    setRefreshCookie(res, newRefresh);
    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error("refreshToken error:", err);
    res.status(403).json({ message: "Token refresh failed." });
  }
};

// ── Logout ────────────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("logout error:", err);
    res.status(500).json({ message: "Logout failed." });
  }
};

// ── Get Me (Protected) ────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Forgot Password ───────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.json({ message: "If that email exists, a reset link was sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr.message);
      // Clear the token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send reset email. Try again." });
    }

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Reset Password ────────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Verify Email ──────────────────────────────────────────────────

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link.",
        code: "INVALID_TOKEN",
      });
    }

    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("verifyEmail error:", err);
    res.status(500).json({ message: "Server error during email verification." });
  }
};

// ── Resend Verification ───────────────────────────────────────────

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Always return 200 to prevent email enumeration
    if (!user || user.isEmailVerified) {
      return res.json({
        message: "If that address is registered and unverified, a new link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    try {
      await emailService.sendVerificationEmail(user, token);
    } catch (emailErr) {
      console.error("Resend verification email failed:", emailErr.message);
      return res.status(500).json({ message: "Failed to send verification email." });
    }

    res.json({
      message: "Verification email resent! Please check your inbox (and spam folder).",
    });
  } catch (err) {
    console.error("resendVerification error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
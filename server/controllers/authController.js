// // server/controllers/authController.js
// // ─────────────────────────────────────────────────────────────────
// // Paste this full file (or merge the changed sections into yours).
// // Changes vs. previous version are marked with  ← NEW  or  ← CHANGED
// // ─────────────────────────────────────────────────────────────────

// const crypto = require("crypto");
// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const emailService = require("../utils/emailService");

// // ── helpers ──────────────────────────────────────────────────────

// const signAccess = (id) =>
//   jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

// const signRefresh = (id) =>
//   jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// const setRefreshCookie = (res, token) =>
//   res.cookie("refreshToken", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   });

// // ── register ─────────────────────────────────────────────────────

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (await User.findOne({ email }))
//       return res.status(400).json({ message: "Email already in use." });

//     // Generate verification token  ← NEW
//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 h

//     const user = await User.create({
//       name,
//       email,
//       password,
//       emailVerificationToken: verificationToken,   // ← NEW
//       emailVerificationExpires: verificationExpires, // ← NEW (add field to model if missing)
//       isEmailVerified: false,                       // ← NEW (explicit)
//     });

//     // Send verification email  ← NEW
//     try {
//       await emailService.sendVerificationEmail(user, verificationToken);
//     } catch (emailErr) {
//       console.error("Verification email failed:", emailErr.message);
//       // Don't block registration if email fails — user can request resend
//     }

//     return res.status(201).json({
//       message:
//         "Registration successful! Please check your email to verify your account before logging in.",
//       userId: user._id,
//     });
//   } catch (err) {
//     console.error("register error:", err);
//     res.status(500).json({ message: "Server error during registration." });
//   }
// };

// // ── login  ← CHANGED: enforce email verification ─────────────────

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ message: "Invalid email or password." });

//     // ── EMAIL VERIFICATION GATE  ← NEW ──────────────────────────
//     if (!user.isEmailVerified) {
//       return res.status(403).json({
//         message:
//           "Please verify your email address before logging in. Check your inbox for a verification link.",
//         code: "EMAIL_NOT_VERIFIED",   // ← frontend checks this code
//         email: user.email,            // ← so frontend can offer resend
//       });
//     }
//     // ─────────────────────────────────────────────────────────────

//     const accessToken = signAccess(user._id);
//     const refreshToken = signRefresh(user._id);

//     user.refreshToken = refreshToken;
//     await user.save();

//     setRefreshCookie(res, refreshToken);

//     res.json({
//       accessToken,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isEmailVerified: user.isEmailVerified,
//       },
//     });
//   } catch (err) {
//     console.error("login error:", err);
//     res.status(500).json({ message: "Server error during login." });
//   }
// };

// // ── verifyEmail  ← NEW ────────────────────────────────────────────

// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     const user = await User.findOne({
//       emailVerificationToken: token,
//       // If you stored expiry, add: emailVerificationExpires: { $gt: Date.now() }
//     });

//     if (!user)
//       return res.status(400).json({
//         message: "Invalid or expired verification link.",
//         code: "INVALID_TOKEN",
//       });

//     user.isEmailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save();

//     res.json({ message: "Email verified successfully! You can now log in." });
//   } catch (err) {
//     console.error("verifyEmail error:", err);
//     res.status(500).json({ message: "Server error during email verification." });
//   }
// };

// // ── resendVerification  ← NEW ────────────────────────────────────

// exports.resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     // Always return 200 to prevent email enumeration
//     if (!user || user.isEmailVerified) {
//       return res.json({
//         message:
//           "If that address is registered and unverified, a new link has been sent.",
//       });
//     }

//     const token = crypto.randomBytes(32).toString("hex");
//     user.emailVerificationToken = token;
//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
//     await user.save();

//     await emailService.sendVerificationEmail(user, token);

//     res.json({
//       message:
//         "Verification email resent! Please check your inbox (and spam folder).",
//     });
//   } catch (err) {
//     console.error("resendVerification error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // ── refresh ───────────────────────────────────────────────────────

// exports.refreshToken = async (req, res) => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (!token) return res.status(401).json({ message: "No refresh token." });

//     const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || user.refreshToken !== token)
//       return res.status(403).json({ message: "Invalid refresh token." });

//     const newAccess = signAccess(user._id);
//     const newRefresh = signRefresh(user._id);

//     user.refreshToken = newRefresh;
//     await user.save();

//     setRefreshCookie(res, newRefresh);
//     res.json({ accessToken: newAccess });
//   } catch (err) {
//     res.status(403).json({ message: "Token expired or invalid." });
//   }
// };

// // ── logout ────────────────────────────────────────────────────────

// exports.logout = async (req, res) => {
//   try {
//     const token = req.cookies.refreshToken;
//     if (token) {
//       const user = await User.findOne({ refreshToken: token });
//       if (user) {
//         user.refreshToken = undefined;
//         await user.save();
//       }
//     }
//     res.clearCookie("refreshToken");
//     res.json({ message: "Logged out." });
//   } catch (err) {
//     res.status(500).json({ message: "Logout failed." });
//   }
// };

// // ── getMe ─────────────────────────────────────────────────────────

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password -refreshToken");
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // ── forgotPassword ────────────────────────────────────────────────

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user)
//       return res.json({ message: "If that email exists, a reset link was sent." });

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.passwordResetToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
//     user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 h
//     await user.save();

//     await emailService.sendPasswordResetEmail(user, resetToken);

//     res.json({ message: "Password reset link sent to your email." });
//   } catch (err) {
//     console.error("forgotPassword error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // ── resetPassword ─────────────────────────────────────────────────

// exports.resetPassword = async (req, res) => {
//   try {
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const user = await User.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() },
//     });

//     if (!user)
//       return res.status(400).json({ message: "Invalid or expired reset token." });

//     user.password = req.body.password;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save();

//     res.json({ message: "Password reset successful. You can now log in." });
//   } catch (err) {
//     console.error("resetPassword error:", err);
//     res.status(500).json({ message: "Server error." });
//   }
// };
// server/controllers/authController.js
// ─────────────────────────────────────────────────────────────────
// Paste this full file (or merge the changed sections into yours).
// Changes vs. previous version are marked with  ← NEW  or  ← CHANGED
// ─────────────────────────────────────────────────────────────────

const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const emailService = require("../utils/emailService");

// ── helpers ──────────────────────────────────────────────────────

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const setRefreshCookie = (res, token) =>
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

// ── register ─────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already in use." });

    // Generate verification token  ← NEW
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 h

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true, // Skip email verification for now
    });

    return res.status(201).json({
      message: "Registration successful! You can now log in.",
      userId: user._id,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// ── login  ← CHANGED: enforce email verification ─────────────────

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });

    // Email verification skipped for now

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

// ── verifyEmail  ← NEW ────────────────────────────────────────────

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      // If you stored expiry, add: emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({
        message: "Invalid or expired verification link.",
        code: "INVALID_TOKEN",
      });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("verifyEmail error:", err);
    res.status(500).json({ message: "Server error during email verification." });
  }
};

// ── resendVerification  ← NEW ────────────────────────────────────

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return 200 to prevent email enumeration
    if (!user || user.isEmailVerified) {
      return res.json({
        message:
          "If that address is registered and unverified, a new link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await emailService.sendVerificationEmail(user, token);

    res.json({
      message:
        "Verification email resent! Please check your inbox (and spam folder).",
    });
  } catch (err) {
    console.error("resendVerification error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── refresh ───────────────────────────────────────────────────────

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token." });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid refresh token." });

    const newAccess = signAccess(user._id);
    const newRefresh = signRefresh(user._id);

    user.refreshToken = newRefresh;
    await user.save();

    setRefreshCookie(res, newRefresh);
    res.json({ accessToken: newAccess });
  } catch (err) {
    res.status(403).json({ message: "Token expired or invalid." });
  }
};

// ── logout ────────────────────────────────────────────────────────

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
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out." });
  } catch (err) {
    res.status(500).json({ message: "Logout failed." });
  }
};

// ── getMe ─────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// ── forgotPassword ────────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.json({ message: "If that email exists, a reset link was sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 h
    await user.save();

    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── resetPassword ─────────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token." });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
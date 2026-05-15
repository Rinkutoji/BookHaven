// server/models/User.js  — ADD these fields to your existing schema
// (merge into your current User.js; don't replace the whole file)
//
// In your userSchema definition, make sure these fields exist:

/*
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshToken: String,
*/

// ─── Full model for reference (replace yours if easier) ───────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // ── Email verification  ← NEW ──────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // ── Password reset ─────────────────────────────────────────────
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ── Auth ───────────────────────────────────────────────────────
    refreshToken: String,

    // ── Profile extras ─────────────────────────────────────────────
    avatar: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
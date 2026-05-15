const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({ user: req.user.toPublicJSON() });
  } catch (err) { next(err); }
});

// PUT /api/users/me
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, avatar, addresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(avatar && { avatar }), ...(addresses && { addresses }) },
      { new: true, runValidators: true }
    );
    res.json({ user: user.toPublicJSON() });
  } catch (err) { next(err); }
});

// PUT /api/users/me/password
router.put('/me/password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (err) { next(err); }
});

module.exports = router;

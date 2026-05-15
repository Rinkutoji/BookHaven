const Newsletter = require('../models/Newsletter');

// POST /api/newsletter/subscribe
const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Check duplicate
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'This email is already subscribed.' });
    }

    await Newsletter.create({ email });

    res.status(201).json({ message: 'Successfully subscribed! Thank you.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/newsletter — Admin: list all subscribers
const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json({ total: subscribers.length, subscribers });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe, getSubscribers };
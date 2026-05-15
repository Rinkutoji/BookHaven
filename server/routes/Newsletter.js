const express = require('express');
const router  = express.Router();
const { subscribe, getSubscribers } = require('../controllers/newslettercontroller');
const { protect, adminOnly } = require('../middleware/auth');

// Public — subscribe
router.post('/subscribe', subscribe);

// Admin — view all subscribers
router.get('/', protect, adminOnly, getSubscribers);

module.exports = router;
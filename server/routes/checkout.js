const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook, getSession } = require('../controllers/checkoutController');
const { protect } = require('../middleware/auth');

// Webhook — raw body, no auth (Stripe calls this directly)
router.post('/webhook', handleWebhook);

router.post('/create-session', protect, createCheckoutSession);
router.get('/session/:sessionId', protect, getSession);

module.exports = router;

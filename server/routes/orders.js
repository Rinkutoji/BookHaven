const express = require('express');
const router = express.Router();
const {
  getMyOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminUpdateOrderNote,
  adminGetOrderStats,
} = require('../controllers/orderController');
const { protect, requireAdmin } = require('../middleware/auth');

// ── User routes ───────────────────────────────────────────────────────────────
router.use(protect);

router.get('/', getMyOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.use(requireAdmin);

router.get('/admin/stats', adminGetOrderStats);
router.get('/admin/list', adminGetOrders);
router.get('/admin/:id', adminGetOrderById);
router.patch('/admin/:id/status', adminUpdateOrderStatus);
router.patch('/admin/:id/note', adminUpdateOrderNote);

module.exports = router;
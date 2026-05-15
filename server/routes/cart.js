// ─── routes/cart.js ──────────────────────────────────────────────────────────
const express = require('express');
const cartRouter = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

cartRouter.use(protect);
cartRouter.get('/', getCart);
cartRouter.post('/add', addToCart);
cartRouter.put('/update', updateCartItem);
cartRouter.delete('/remove/:bookId', removeFromCart);
cartRouter.delete('/clear', clearCart);

module.exports = cartRouter;

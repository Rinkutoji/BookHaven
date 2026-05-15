const { Cart } = require('../models/CartWishlist');
const Book = require('../models/Book');

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title author coverImage price originalPrice stock inStock',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/add
const addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) return res.status(400).json({ error: 'bookId is required.' });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    if (book.stock < 1) return res.status(400).json({ error: 'Book is out of stock.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((i) => i.book.toString() === bookId);

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > book.stock) {
        return res.status(400).json({ error: `Only ${book.stock} copies available.` });
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({ book: bookId, quantity: Number(quantity) });
    }

    await cart.save();

    cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title author coverImage price originalPrice stock',
    });

    res.json({ cart, message: 'Added to cart.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/update
const updateCartItem = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;

    if (!bookId || quantity === undefined) {
      return res.status(400).json({ error: 'bookId and quantity are required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    const item = cart.items.find((i) => i.book.toString() === bookId);
    if (!item) return res.status(404).json({ error: 'Item not in cart.' });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
    } else {
      const book = await Book.findById(bookId).select('stock');
      if (quantity > book.stock) {
        return res.status(400).json({ error: `Only ${book.stock} copies available.` });
      }
      item.quantity = Number(quantity);
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title author coverImage price originalPrice stock',
    });

    res.json({ cart: updatedCart });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/remove/:bookId
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found.' });

    cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title author coverImage price originalPrice stock',
    });

    res.json({ cart: updatedCart, message: 'Item removed.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

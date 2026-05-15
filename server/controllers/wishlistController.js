const { Wishlist } = require('../models/CartWishlist');

// GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'books.book',
      select: 'title author coverImage price originalPrice rating numReviews stock',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [] });
    }

    res.json({ wishlist });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist/toggle
const toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ error: 'bookId is required.' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, books: [] });

    const exists = wishlist.books.find((b) => b.book.toString() === bookId);

    if (exists) {
      wishlist.books = wishlist.books.filter((b) => b.book.toString() !== bookId);
      await wishlist.save();
      return res.json({ message: 'Removed from wishlist.', added: false });
    } else {
      wishlist.books.push({ book: bookId });
      await wishlist.save();
      return res.json({ message: 'Added to wishlist.', added: true });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, toggleWishlist };

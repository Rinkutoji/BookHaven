const express = require('express');
const router = express.Router();
const { getBooks, getBook, getGenres, addReview, createBook, updateBook } = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getBooks);
router.get('/genres', getGenres);
router.get('/:id', getBook);
router.post('/:id/reviews', protect, addReview);

// Admin
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);

module.exports = router;

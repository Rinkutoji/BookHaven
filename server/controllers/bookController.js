const Book = require('../models/Book');

// GET /api/books
const getBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      genre,
      sort = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice,
      search,
      featured,
      bestseller,
      newArrival,
      format,
    } = req.query;

    const filter = {};

    // Text search — $regex supports Khmer + Latin characters
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title:       regex },
        { author:      regex },
        { description: regex },
        { genre:       regex },
      ];
    }

    // Filters
    if (genre) filter.genre = { $in: genre.split(',') };

    // Case-insensitive format filter — handles mismatched seeds (e.g. "ebook" vs "Ebook")
    if (format) filter.format = { $regex: new RegExp(`^${format}$`, 'i') };

    if (featured === 'true') filter.featured = true;
    if (bestseller === 'true') filter.bestseller = true;
    if (newArrival === 'true') filter.newArrival = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const totalDocs = await Book.countDocuments(filter);

    const books = await Book.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');

    res.json({
      books,
      pagination: {
        total: totalDocs,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalDocs / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/books/:id
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews.user', 'name avatar');

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    res.json({ book });
  } catch (err) {
    next(err);
  }
};

// GET /api/books/genres — list all genres
const getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre');
    res.json({ genres: genres.sort() });
  } catch (err) {
    next(err);
  }
};

// POST /api/books/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });

    // Check: one review per user
    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(409).json({ error: 'You have already reviewed this book.' });
    }

    book.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    book.recalculateRating();
    await book.save();

    res.status(201).json({ message: 'Review added.', rating: book.rating, numReviews: book.numReviews });
  } catch (err) {
    next(err);
  }
};

// Admin: POST /api/books
const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ book });
  } catch (err) {
    next(err);
  }
};

// Admin: PUT /api/books/:id
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    res.json({ book });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBooks, getBook, getGenres, addReview, createBook, updateBook };
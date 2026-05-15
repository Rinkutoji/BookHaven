// server/controllers/searchController.js
// Handles autocomplete suggestions and full search with filters
// Supports: title, author, category filtering + pagination

const Book = require('../models/Book');

// ─────────────────────────────────────────────
// GET /api/search/autocomplete?q=harry
// Returns up to 6 quick suggestions (title + author)
// ─────────────────────────────────────────────
const autocomplete = async (req, res) => {
  try {
    const { q } = req.query;

    // Need at least 2 characters to suggest
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(q.trim(), 'i'); // case-insensitive

    const books = await Book.find({
      $or: [
        { title: regex },
        { author: regex },
      ],
      isActive: true,
    })
      .select('title author coverImage slug _id') // only what we need
      .limit(6)
      .lean();

    // Shape into suggestion objects
    const suggestions = books.map((book) => ({
      _id:         book._id,
      title:       book.title,
      author:      book.author,
      coverImage:  book.coverImage,
      slug:        book.slug,
      type:        'book',
    }));

    res.json({ suggestions });
  } catch (err) {
    console.error('Autocomplete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// GET /api/search?q=&author=&category=&page=1&limit=12&sort=relevance
// Full search with optional filters + pagination
// ─────────────────────────────────────────────
const search = async (req, res) => {
  try {
    const {
      q        = '',
      author   = '',
      category = '',
      page     = 1,
      limit    = 12,
      sort     = 'relevance',
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // ── Build query ──────────────────────────
    const query = { isActive: true };

    // Text search: title OR author match
    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [{ title: regex }, { author: regex }, { description: regex }];
    }

    // Author filter (exact-ish, case-insensitive)
    if (author.trim()) {
      query.author = new RegExp(author.trim(), 'i');
    }

    // Category filter
    if (category.trim()) {
      query.category = new RegExp(category.trim(), 'i');
    }

    // ── Sort options ─────────────────────────
    const sortMap = {
      relevance:  { score: { $meta: 'textScore' } }, // fallback to newest if no text index
      newest:     { createdAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { rating: -1 },
    };
    // If no text query, relevance == newest
    const sortOption = (sort === 'relevance' && !q.trim())
      ? { createdAt: -1 }
      : (sortMap[sort] || { createdAt: -1 });

    // ── Execute ──────────────────────────────
    const [books, total] = await Promise.all([
      Book.find(query)
        .select('title author coverImage price rating category slug _id stock')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments(query),
    ]);

    // ── Distinct authors + categories for filter dropdowns ──
    // Only run when it's a "fresh" search (page 1) to avoid extra DB hits
    let filterOptions = {};
    if (pageNum === 1) {
      const [authors, categories] = await Promise.all([
        Book.distinct('author', { isActive: true }),
        Book.distinct('category', { isActive: true }),
      ]);
      filterOptions = {
        authors:    authors.sort(),
        categories: categories.sort(),
      };
    }

    res.json({
      books,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore:    pageNum < Math.ceil(total / limitNum),
      },
      filterOptions,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { autocomplete, search };
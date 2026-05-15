// server/routes/search.js
// Public routes — no auth required for searching

const express                    = require('express');
const router                     = express.Router();
const { autocomplete, search }   = require('../controllers/searchController');

// GET /api/search/autocomplete?q=harry
router.get('/autocomplete', autocomplete);

// GET /api/search?q=harry&author=&category=&page=1&sort=relevance
router.get('/', search);

module.exports = router;
// client/src/components/search/FilterPanel.jsx
// Left-sidebar filter panel for SearchPage
// Props: filters (object), onChange (fn), options (authors/categories from API)

export default function FilterPanel({ filters, onChange, options = {} }) {
  const { authors = [], categories = [] } = options;

  const handle = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  const clearAll = () =>
    onChange({ q: filters.q, page: 1, sort: 'relevance', author: '', category: '' });

  const hasActiveFilters = filters.author || filters.category || filters.sort !== 'relevance';

  return (
    <aside className="w-full space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 font-playfair">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Sort ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Sort by
        </label>
        <div className="space-y-1">
          {[
            { value: 'relevance',  label: 'Most Relevant' },
            { value: 'newest',     label: 'Newest First' },
            { value: 'price_asc',  label: 'Price: Low → High' },
            { value: 'price_desc', label: 'Price: High → Low' },
            { value: 'rating',     label: 'Top Rated' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handle('sort', opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.sort === opt.value
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category ── */}
      {categories.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Category
          </label>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            <button
              onClick={() => handle('category', '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !filters.category
                  ? 'bg-brand-100 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handle('category', cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.category === cat
                    ? 'bg-brand-100 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Author ── */}
      {authors.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Author
          </label>
          <select
            value={filters.author}
            onChange={(e) => handle('author', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-brand-400"
          >
            <option value="">All Authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}
    </aside>
  );
}
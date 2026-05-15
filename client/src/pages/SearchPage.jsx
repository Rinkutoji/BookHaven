// client/src/pages/SearchPage.jsx
// Full search results page
// URL: /search?q=harry&category=Fiction&author=&sort=relevance&page=1

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import BookCard from '../components/books/BookCard';
import FilterPanel from '../components/search/FilterPanel';
import PageLoader from '../components/ui/PageLoader';

const DEFAULT_FILTERS = {
  q:        '',
  author:   '',
  category: '',
  sort:     'relevance',
  page:     1,
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read initial state from URL ───────────────
  const [filters, setFilters] = useState(() => ({
    q:        searchParams.get('q')        || '',
    author:   searchParams.get('author')   || '',
    category: searchParams.get('category') || '',
    sort:     searchParams.get('sort')     || 'relevance',
    page:     parseInt(searchParams.get('page') || '1'),
  }));

  const [results,       setResults]       = useState([]);
  const [pagination,    setPagination]    = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [mobileFilter,  setMobileFilter]  = useState(false);

  // ── Sync filters → URL ────────────────────────
  useEffect(() => {
    const params = {};
    if (filters.q)        params.q        = filters.q;
    if (filters.author)   params.author   = filters.author;
    if (filters.category) params.category = filters.category;
    if (filters.sort !== 'relevance') params.sort = filters.sort;
    if (filters.page > 1) params.page     = filters.page;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // ── Fetch results ─────────────────────────────
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Map SearchPage filter fields → bookController query params
      const params = {
        search: filters.q,
        page:   filters.page,
        sort:   filters.sort === 'relevance' ? 'createdAt' : filters.sort,
      };
      if (filters.category) params.genre  = filters.category;
      if (filters.author)   params.author = filters.author;

      const { data } = await api.get('/books', { params });
      setResults(data.books || []);
      // bookController returns pagination.pages, SearchPage expects totalPages
      setPagination({
        ...data.pagination,
        totalPages: data.pagination.pages,
        hasMore:    data.pagination.page < data.pagination.pages,
      });
    } catch {
      setError('ការស្វែងរកបានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);

  const handlePageChange = (newPage) =>
    setFilters((f) => ({ ...f, page: newPage }));

  // ── Scroll to top on page change ─────────────
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [filters.page]);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-playfair text-gray-900">
            {filters.q ? (
              <>លទ្ធផលស្វែងរកសម្រាប់ <span className="text-brand-600">«{filters.q}»</span></>
            ) : (
              'រក្សាទុក & ស្វែងរកសៀវភៅ'
            )}
          </h1>
          {pagination.total !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} លទ្ធផល
              {filters.category && <> ក្នុងប្រភេទ <strong>{filters.category}</strong></>}
              {filters.author   && <> ដោយ <strong>{filters.author}</strong></>}
            </p>
          )}
        </div>

        <div className="flex gap-6">
          {/* ── Desktop sidebar ── */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 sticky top-24">
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                options={filterOptions}
              />
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMobileFilter(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Filters
                {(filters.category || filters.author) && (
                  <span className="bg-brand-500 text-white text-xs rounded-full px-1.5 py-0.5">!</span>
                )}
              </button>
            </div>

            {/* Loading */}
            {loading && <PageLoader />}

            {/* Error */}
            {!loading && error && (
              <div className="text-center py-16 text-red-500">{error}</div>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
              <div className="text-center py-20">
                <MagnifyingGlassIcon className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  រកមិនឃើញសៀវភៅ
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  ព្យាយាមប្រើពាក្យផ្សេង ឬដំណើរការ filters
                </p>
                <Link
                  to="/books"
                  className="inline-block bg-brand-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  មើលសៀវភៅទាំងអស់
                </Link>
              </div>
            )}

            {/* Results grid */}
            {!loading && results.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {results.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => handlePageChange(filters.page - 1)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      ← មុន
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - filters.page) <= 2 || p === 1 || p === pagination.totalPages)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              p === filters.page
                                ? 'bg-brand-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      disabled={!pagination.hasMore}
                      onClick={() => handlePageChange(filters.page + 1)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      បន្ទាប់ →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilter(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={() => setMobileFilter(false)}>
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onChange={(f) => { handleFilterChange(f); setMobileFilter(false); }}
              options={filterOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
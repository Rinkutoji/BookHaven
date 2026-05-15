import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { booksApi } from '../lib/api';
import BookCard from '../components/books/BookCard';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc',      label: 'Price: Low to High' },
  { value: 'price-desc',     label: 'Price: High to Low' },
  { value: 'rating-desc',    label: 'Highest Rated' },
  { value: 'sold-desc',      label: 'Most Popular' },
];

const FORMATS = ['Paperback', 'Hardcover', 'Ebook', 'Audiobook'];

// ─── Skeleton extracted outside BooksPage to avoid re-mount on every render ───
const Skeleton = () => (
  <div className="card animate-pulse">
    <div className="aspect-[2/3] skeleton" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-5 w-1/4 mt-2" />
    </div>
  </div>
);

// ─── FilterContent extracted outside BooksPage ────────────────────────────────
// FIX: Declaring components inside a render function causes React to treat them
// as NEW component types on every render, forcing full unmount + remount.
// This was the root cause: clicking a filter button triggered a re-render,
// which unmounted the drawer's FilterContent before the URL update propagated.
function FilterContent({ genres, searchParams, updateParam, clearFilters, setFiltersOpen }) {
  const genre      = searchParams.get('genre')      || '';
  const format     = searchParams.get('format')     || '';
  const minPrice   = searchParams.get('minPrice')   || '';
  const maxPrice   = searchParams.get('maxPrice')   || '';

  const hasFilters = !!(
    genre || format ||
    searchParams.get('featured') ||
    searchParams.get('bestseller') ||
    searchParams.get('newArrival') ||
    minPrice || maxPrice
  );

  return (
    <div className="space-y-6">
      {/* Genres */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Genre</h3>
        <div className="space-y-1">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => updateParam('genre', genre === g ? '' : g)}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                genre === g
                  ? 'bg-brand-500 text-white'
                  : 'text-ink hover:bg-cream-100'
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Format</h3>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => updateParam('format', format === f ? '' : f)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                format === f
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'border-cream-300 text-ink hover:border-brand-400'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="input text-sm py-2 w-1/2"
            min="0"
          />
          <span className="text-ink-muted">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="input text-sm py-2 w-1/2"
            min="0"
          />
        </div>
      </div>

      {/* Collection filters */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Collections</h3>
        {[
          { key: 'featured',   label: '✨ Featured'     },
          { key: 'bestseller', label: '🔥 Bestsellers'  },
          { key: 'newArrival', label: '🆕 New Arrivals' },
        ].map(({ key, label }) => {
          const val = searchParams.get(key);
          return (
            <button
              key={key}
              onClick={() => updateParam(key, val ? '' : 'true')}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors',
                val ? 'bg-brand-500 text-white' : 'text-ink hover:bg-cream-100'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {hasFilters && (
        <button
          onClick={() => { clearFilters(); setFiltersOpen(false); }}
          className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-1"
        >
          <X size={14} /> Clear All Filters
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks]               = useState([]);
  const [genres, setGenres]             = useState([]);
  const [pagination, setPagination]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const search     = searchParams.get('search')     || '';
  const genre      = searchParams.get('genre')      || '';
  const format     = searchParams.get('format')     || '';
  const featured   = searchParams.get('featured')   || '';
  const bestseller = searchParams.get('bestseller') || '';
  const newArrival = searchParams.get('newArrival') || '';
  const sortVal    = searchParams.get('sort')        || 'createdAt-desc';
  const page       = Number(searchParams.get('page') || 1);
  const minPrice   = searchParams.get('minPrice')   || '';
  const maxPrice   = searchParams.get('maxPrice')   || '';

  const [sort, order] = sortVal.split('-');

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtersOpen]);

  // Stable updateParam — useCallback prevents unnecessary re-renders of
  // FilterContent when only unrelated state (books, loading…) changes.
  const updateParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) { next.set(key, value); } else { next.delete(key); }
      next.delete('page');
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  useEffect(() => {
    booksApi.genres().then(({ data }) => setGenres(data.genres));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await booksApi.list({
          page, limit: 12, search, genre, format, featured, bestseller,
          newArrival, sort, order, minPrice, maxPrice,
        });
        setBooks(data.books);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilterCount = [genre, format, featured, bestseller, newArrival, minPrice, maxPrice]
    .filter(Boolean).length;

  // Shared props for both desktop sidebar and mobile drawer
  const filterProps = { genres, searchParams, updateParam, clearFilters, setFiltersOpen };

  return (
    <div className="page-container py-10">

      {/* ── Mobile filter drawer ─────────────────────────────────────────────
          FIX: Always rendered in the DOM (never conditionally mounted).
          Visibility is controlled by pointer-events + opacity + translate so
          the component stays mounted and its event handlers stay stable.
          Using `filtersOpen && <Drawer>` caused the drawer to unmount the
          moment a filter button fired a re-render, making filters appear broken.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-300',
          filtersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        aria-modal="true"
        role="dialog"
        aria-hidden={!filtersOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setFiltersOpen(false)}
        />

        {/* Drawer panel */}
        <div
          className={clsx(
            'absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col',
            'transition-transform duration-300 ease-in-out',
            filtersOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-cream-200 flex-shrink-0">
            <h2 className="font-display text-xl font-semibold">Filters</h2>
            <button
              onClick={() => setFiltersOpen(false)}
              className="p-1 rounded-lg hover:bg-cream-100 transition-colors"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <FilterContent {...filterProps} />
          </div>

          {/* Sticky footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-cream-200">
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full btn-primary py-3 text-sm font-semibold"
            >
              Show {pagination.total ?? ''} Results
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {search     ? `Results for "${search}"` :
             genre      ? genre :
             featured   ? 'Featured Books' :
             bestseller ? 'Bestsellers' :
             newArrival ? 'New Arrivals' :
                          'All Books'}
          </h1>
          {!loading && (
            <p className="text-ink-muted text-sm mt-1">
              {pagination.total ?? 0} books found
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden btn-secondary text-sm py-2 gap-2 flex items-center"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortVal}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input text-sm py-2 pr-8 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <FilterContent {...filterProps} />
        </aside>

        {/* Book grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {Array(12).fill(0).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">📚</p>
              <h3 className="font-display text-2xl text-ink mb-2">No books found</h3>
              <p className="text-ink-muted mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {books.map((book) => <BookCard key={book._id} book={book} />)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center flex-wrap gap-2 mt-10">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.set('page', p);
                          return next;
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={clsx(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                        p === page
                          ? 'bg-brand-500 text-white shadow-warm'
                          : 'bg-white text-ink border border-cream-300 hover:border-brand-400'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
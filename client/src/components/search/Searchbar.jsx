// client/src/components/search/SearchBar.jsx
// Autocomplete search bar with keyboard navigation
// Used inside Navbar — navigates to /search?q=...

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import { debounce } from '../../lib/debounce';   // we'll create this tiny util

export default function SearchBar({ onClose }) {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const dropRef   = useRef(null);

  const [query,       setQuery]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [open,        setOpen]        = useState(false);

  // ── Focus input on mount ─────────────────────
  useEffect(() => { inputRef.current?.focus(); }, []);

  // ── Fetch suggestions (debounced 300ms) ──────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (q) => {
      if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
      try {
        setLoading(true);
        const { data } = await api.get('/search/autocomplete', { params: { q } });
        setSuggestions(data.suggestions || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    fetchSuggestions(val);
  };

  // ── Keyboard navigation ───────────────────────
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        goToBook(suggestions[activeIdx]);
      } else {
        submitSearch();
      }
    }
  };

  const submitSearch = () => {
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/books?search=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  const goToBook = (book) => {
    setOpen(false);
    navigate(`/books/${book.slug || book._id}`);
    onClose?.();
  };

  // ── Close dropdown on outside click ──────────
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clearInput = () => { setQuery(''); setSuggestions([]); setOpen(false); inputRef.current?.focus(); };

  return (
    <div ref={dropRef} className="relative w-full max-w-xl">
      {/* ── Input ── */}
      <div className="flex items-center gap-2 bg-white border-2 border-brand-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-brand-500 transition-colors">
        <MagnifyingGlassIcon className="w-5 h-5 text-brand-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="ស្វែងរកឈ្មោះសៀវភៅ ឬអ្នកនិពន្ធ…"
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
        />
        {query && (
          <button onClick={clearInput} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={submitSearch}
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-3 py-1 rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* ── Dropdown suggestions ── */}
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              កំពុងស្វែងរក…
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              រកមិនឃើញ «{query}»
            </div>
          )}

          {!loading && suggestions.map((book, idx) => (
            <button
              key={book._id}
              onMouseDown={() => goToBook(book)}   // mousedown fires before blur
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                idx === activeIdx ? 'bg-brand-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Cover thumbnail */}
              <img
                src={book.coverImage || '/placeholder-book.png'}
                alt={book.title}
                className="w-8 h-11 object-cover rounded shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{book.title}</p>
                <p className="text-xs text-gray-500 truncate">{book.author}</p>
              </div>
            </button>
          ))}

          {/* "See all results" footer */}
          {!loading && suggestions.length > 0 && (
            <button
              onMouseDown={submitSearch}
              className="w-full px-4 py-2.5 text-xs text-brand-600 font-medium bg-brand-50 hover:bg-brand-100 transition-colors text-center border-t border-gray-100"
            >
              មើលលទ្ធផលទាំងអស់សម្រាប់ «{query}» →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState, useCallback } from 'react';
import './SearchBar.css';

const CATEGORIES = [
  { id: 'all', label: '🌐 All', value: 'all' },
  { id: 'cafe', label: '☕ Café', value: 'cafe' },
  { id: 'restaurant', label: '🍔 Restaurant', value: 'restaurant' },
  { id: 'library', label: '📚 Library', value: 'library' },
  { id: 'coworking', label: '💻 Coworking', value: 'coworking' },
  { id: 'airport', label: '✈️ Airport', value: 'airport' },
  { id: 'hotel', label: '🏨 Hotel', value: 'hotel' },
];

const RADIUS_OPTIONS = [
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  radius,
  onRadiusChange,
  resultCount,
  loading,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback(
    (e) => onSearchChange(e.target.value),
    [onSearchChange]
  );

  const handleCategoryClick = (value) => {
    onCategoryChange(value);
    setShowFilters(false);
  };

  const handleRadiusClick = (value) => {
    onRadiusChange(value);
    setShowFilters(false);
  };

  return (
    <div className="search-bar-container">
      {/* Search Input */}
      <div className="search-input-wrap">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          id="wifi-search"
          type="search"
          className="search-input"
          placeholder="Search Wi-Fi spots…"
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search Wi-Fi hotspots"
          autoComplete="off"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          className={`filter-toggle ${showFilters ? 'filter-toggle--active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <span className="filter-toggle-icon">⚙️</span>
          <span className="filter-toggle-label">Filters</span>
        </button>
      </div>

      {/* Result count */}
      <div className="search-meta" aria-live="polite">
        {loading ? (
          <span className="search-meta-loading">
            <span className="mini-spinner" aria-hidden="true"></span>
            Fetching hotspots…
          </span>
        ) : (
          <span className="search-meta-count">
            {resultCount === 0
              ? 'No hotspots found'
              : `${resultCount} hotspot${resultCount !== 1 ? 's' : ''} found`}
          </span>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel" role="group" aria-label="Filter options">
          {/* Category chips */}
          <div className="filter-section">
            <p className="filter-label">Category</p>
            <div className="category-chips">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`category-${cat.id}`}
                  className={`chip ${activeCategory === cat.value ? 'chip--active' : ''}`}
                  onClick={() => handleCategoryClick(cat.value)}
                  aria-pressed={activeCategory === cat.value}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radius selector */}
          <div className="filter-section">
            <p className="filter-label">Search Radius</p>
            <div className="radius-chips">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  id={`radius-${opt.value}`}
                  className={`chip chip--sm ${radius === opt.value ? 'chip--active' : ''}`}
                  onClick={() => handleRadiusClick(opt.value)}
                  aria-pressed={radius === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

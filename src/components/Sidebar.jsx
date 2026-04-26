import React, { useRef, useEffect } from 'react';
import HotspotCard from './HotspotCard';
import LocationBanner from './LocationBanner';
import SearchBar from './SearchBar';
import './Sidebar.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-bar"></div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--title"></div>
        <div className="skeleton-line skeleton-line--short"></div>
        <div className="skeleton-line skeleton-line--medium"></div>
      </div>
    </div>
  );
}

export default function Sidebar({
  hotspots,
  filteredHotspots,
  selectedId,
  onSelect,
  loading,
  error,
  onRefetch,
  coords,
  geoLoading,
  geoError,
  permissionDenied,
  onGeoRetry,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  radius,
  onRadiusChange,
  isMobileOpen,
  onMobileClose,
}) {
  const listRef = useRef(null);

  // Scroll active card into view
  useEffect(() => {
    if (selectedId && listRef.current) {
      const activeCard = listRef.current.querySelector('.hotspot-card--active');
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedId]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isMobileOpen ? 'sidebar--open' : ''}`}
        aria-label="Wi-Fi hotspots panel"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-title-row">
            <div className="sidebar-logo">
              <span className="sidebar-logo-icon" aria-hidden="true">📡</span>
              <div>
                <h1 className="sidebar-title">Wi-Fi Finder</h1>
                <p className="sidebar-subtitle">Free public hotspots near you</p>
              </div>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={onMobileClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Location Banner */}
          <LocationBanner
            coords={coords}
            geoLoading={geoLoading}
            geoError={geoError}
            permissionDenied={permissionDenied}
            onRetry={onGeoRetry}
          />

          {/* Search & Filters */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            radius={radius}
            onRadiusChange={onRadiusChange}
            resultCount={filteredHotspots.length}
            loading={loading}
          />
        </div>

        {/* Hotspot List */}
        <div className="sidebar-list" ref={listRef} role="list">
          {/* Loading skeletons */}
          {loading && hotspots.length === 0 && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="sidebar-error" role="alert">
              <span className="sidebar-error-icon">⚠️</span>
              <p className="sidebar-error-msg">{error}</p>
              <button className="sidebar-retry-btn" onClick={onRefetch}>
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredHotspots.length === 0 && coords && (
            <div className="sidebar-empty">
              <span className="sidebar-empty-icon">🔍</span>
              <p className="sidebar-empty-title">No hotspots found</p>
              <p className="sidebar-empty-sub">
                Try increasing the radius or changing filters
              </p>
              <button className="sidebar-retry-btn" onClick={onRefetch}>
                Refresh
              </button>
            </div>
          )}

          {/* No location state */}
          {!loading && !error && !coords && !geoLoading && (
            <div className="sidebar-empty">
              <span className="sidebar-empty-icon">📍</span>
              <p className="sidebar-empty-title">Location needed</p>
              <p className="sidebar-empty-sub">
                Allow location access to find Wi-Fi hotspots near you
              </p>
            </div>
          )}

          {/* Cards */}
          {filteredHotspots.map((hotspot, index) => (
            <div key={hotspot.id} role="listitem">
              <HotspotCard
                hotspot={hotspot}
                isActive={hotspot.id === selectedId}
                onClick={() => onSelect(hotspot)}
                index={index}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            Data from{' '}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-footer-link"
            >
              OpenStreetMap
            </a>{' '}
            contributors
          </p>
          {!loading && coords && (
            <button
              className="sidebar-refresh-btn"
              onClick={onRefetch}
              aria-label="Refresh hotspot data"
            >
              ↻ Refresh
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

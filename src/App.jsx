import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';

import { useGeolocation } from './hooks/useGeolocation';
import { useHotspots } from './hooks/useHotspots';
import LoadingOverlay from './components/LoadingOverlay';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import HotspotDetails from './components/HotspotDetails';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  // ── State ──────────────────────────────────────────────────────
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [radius, setRadius] = useState(2000);
  const [showWelcome, setShowWelcome] = useState(true);
  // Auto-open sidebar on mobile so users see the panel on first load
  const [isMobileOpen, setIsMobileOpen] = useState(() => window.innerWidth <= 768);

  // Keep sidebar open state in sync if window is resized across breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setIsMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Geolocation ────────────────────────────────────────────────
  const {
    coords,
    loading: geoLoading,
    error: geoError,
    permissionDenied,
    retry: geoRetry,
  } = useGeolocation();

  // ── Hotspot data from Overpass API ─────────────────────────────
  const {
    hotspots,
    loading: hotspotsLoading,
    error: hotspotsError,
    refetch,
  } = useHotspots(coords, radius);

  // ── Filtered hotspots (search + category) ──────────────────────
  const filteredHotspots = useMemo(() => {
    let result = hotspots;

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter((h) => h.category === activeCategory);
    }

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.address && h.address.toLowerCase().includes(q)) ||
          h.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [hotspots, activeCategory, searchQuery]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSelectHotspot = useCallback((hotspot) => {
    setSelectedHotspot((prev) => (prev?.id === hotspot.id ? null : hotspot));
  }, []);

  const handleRadiusChange = useCallback(
    (newRadius) => {
      setRadius(newRadius);
      setSelectedHotspot(null);
    },
    []
  );

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setSelectedHotspot(null);
  }, []);

  // ── Initial loading state (waiting for geolocation) ────────────
  const isInitialLoad = geoLoading && !coords;

  if (isInitialLoad) {
    return <LoadingOverlay message="Detecting your location…" />;
  }

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <Sidebar
        hotspots={hotspots}
        filteredHotspots={filteredHotspots}
        selectedId={selectedHotspot?.id ?? null}
        onSelect={handleSelectHotspot}
        loading={hotspotsLoading}
        error={hotspotsError}
        onRefetch={refetch}
        coords={coords}
        geoLoading={geoLoading}
        geoError={geoError}
        permissionDenied={permissionDenied}
        onGeoRetry={geoRetry}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        radius={radius}
        onRadiusChange={handleRadiusChange}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* ── Map Area ── */}
      <div className="map-area">
        {/* Hotspot count badge */}
        {filteredHotspots.length > 0 && (
          <div className="map-count-badge" aria-live="polite">
            <span className="map-count-badge-number">{filteredHotspots.length}</span>
            <span className="map-count-badge-label">
              Wi-Fi<br />hotspot{filteredHotspots.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <MapView
          coords={coords}
          hotspots={filteredHotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={handleSelectHotspot}
          radius={radius}
        />

        {/* Hotspot details sliding panel */}
        {selectedHotspot && (
          <HotspotDetails hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
        )}
      </div>

      {/* ── Mobile FAB (opens sidebar) ── */}
      <button
        id="open-sidebar-fab"
        className="mobile-fab"
        onClick={() => setIsMobileOpen(true)}
        aria-label={`Open hotspot list — ${filteredHotspots.length} found`}
      >
        📡 {filteredHotspots.length} Hotspot{filteredHotspots.length !== 1 ? 's' : ''} Nearby
      </button>

      {/* ── Welcome Screen ── */}
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
    </div>
  );
}

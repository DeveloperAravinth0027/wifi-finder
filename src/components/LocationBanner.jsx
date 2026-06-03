import React from 'react';
import './LocationBanner.css';

export default function LocationBanner({ coords, geoLoading, geoError, permissionDenied, onRetry }) {
  if (geoLoading) {
    return (
      <div className="location-banner location-banner--loading" role="status">
        <div className="banner-icon">📍</div>
        <div className="banner-text">
          <span className="banner-label">Detecting your location…</span>
        </div>
        <div className="banner-spinner" aria-hidden="true"></div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="location-banner location-banner--error" role="alert">
        <div className="banner-icon">🚫</div>
        <div className="banner-text">
          <span className="banner-label">Location access denied</span>
          <span className="banner-sub">Enable location in browser settings, then retry</span>
        </div>
        <button className="banner-btn" onClick={onRetry} aria-label="Retry location access">
          Retry
        </button>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="location-banner location-banner--error" role="alert">
        <div className="banner-icon">⚠️</div>
        <div className="banner-text">
          <span className="banner-label">Location unavailable</span>
          <span className="banner-sub">{geoError}</span>
        </div>
        <button className="banner-btn" onClick={onRetry} aria-label="Retry location">
          Retry
        </button>
      </div>
    );
  }

  if (coords) {
    return (
      <div className="location-banner location-banner--success" role="status">
        <div className="banner-icon">✅</div>
        <div className="banner-text">
          <span className="banner-label">Location detected</span>
          <span className="banner-sub">
            {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
            {coords.accuracy && ` · ±${Math.round(coords.accuracy)}m`}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

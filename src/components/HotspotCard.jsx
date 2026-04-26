import React from 'react';
import { getCategoryLabel } from '../utils/overpass';
import { formatDistance } from '../utils/distance';
import './HotspotCard.css';

const CATEGORY_COLORS = {
  cafe: '#f6ad55',
  restaurant: '#fc8181',
  library: '#68d391',
  coworking: '#63b3ed',
  airport: '#b794f4',
  hotel: '#f687b3',
  shop: '#76e4f7',
  hotspot: '#90cdf4',
};

export default function HotspotCard({ hotspot, isActive, onClick, index }) {
  const color = CATEGORY_COLORS[hotspot.category] || CATEGORY_COLORS.hotspot;

  return (
    <article
      className={`hotspot-card ${isActive ? 'hotspot-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-pressed={isActive}
      aria-label={`${hotspot.name}, ${getCategoryLabel(hotspot.category)}`}
      style={{ '--card-accent': color, animationDelay: `${Math.min(index * 0.04, 0.5)}s` }}
    >
      {/* Left accent bar */}
      <div className="card-accent-bar" aria-hidden="true"></div>

      <div className="card-body">
        {/* Header row */}
        <div className="card-header">
          <h3 className="card-name">{hotspot.name}</h3>
          {hotspot.distance !== undefined && (
            <span className="card-distance">{formatDistance(hotspot.distance)}</span>
          )}
        </div>

        {/* Category badge */}
        <div className="card-meta">
          <span className="card-badge" style={{ color }}>
            {getCategoryLabel(hotspot.category)}
          </span>
          <span className="card-wifi-tag">
            <span className="wifi-dot-small" aria-hidden="true">●</span>
            {hotspot.wifiInfo}
          </span>
        </div>

        {/* Address */}
        {hotspot.address && (
          <p className="card-address">
            <span aria-hidden="true">📍</span> {hotspot.address}
          </p>
        )}

        {/* Opening hours */}
        {hotspot.openingHours && (
          <p className="card-hours">
            <span aria-hidden="true">🕐</span> {hotspot.openingHours}
          </p>
        )}

        {/* Action links */}
        <div className="card-actions">
          {hotspot.website && (
            <a
              href={hotspot.website}
              target="_blank"
              rel="noopener noreferrer"
              className="card-link"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Visit ${hotspot.name} website`}
            >
              🌐 Website
            </a>
          )}
          <a
            href={`https://www.openstreetmap.org/?mlat=${hotspot.lat}&mlon=${hotspot.lon}#map=17/${hotspot.lat}/${hotspot.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${hotspot.name} on OpenStreetMap`}
          >
            🗺️ OSM
          </a>
        </div>
      </div>
    </article>
  );
}

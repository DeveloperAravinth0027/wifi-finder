import React from 'react';
import { getCategoryLabel } from '../utils/overpass';
import { formatDistance } from '../utils/distance';
import './HotspotDetails.css';

export default function HotspotDetails({ hotspot, onClose }) {
  if (!hotspot) return null;

  return (
    <div className="hotspot-details-panel">
      <div className="details-container">
        <button className="details-close-btn" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        <div className="details-header">
          <span className="details-category">{getCategoryLabel(hotspot.category)}</span>
          <h2 className="details-name">{hotspot.name}</h2>
          {hotspot.distance !== undefined && (
            <span className="details-distance">{formatDistance(hotspot.distance)} away</span>
          )}
        </div>

        <div className="details-body">
          <div className="details-info-grid">
            {hotspot.address && (
              <div className="detail-row">
                <span className="detail-icon" aria-hidden="true">📍</span>
                <div className="detail-content">
                  <span className="detail-label">Address</span>
                  <p>{hotspot.address}</p>
                </div>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-icon" aria-hidden="true">📡</span>
              <div className="detail-content">
                <span className="detail-label">Network</span>
                <p className="wifi-status">{hotspot.wifiInfo}</p>
              </div>
            </div>

            {hotspot.openingHours && (
              <div className="detail-row">
                <span className="detail-icon" aria-hidden="true">🕐</span>
                <div className="detail-content">
                  <span className="detail-label">Hours</span>
                  <p>{hotspot.openingHours}</p>
                </div>
              </div>
            )}

            {hotspot.phone && (
              <div className="detail-row">
                <span className="detail-icon" aria-hidden="true">📞</span>
                <div className="detail-content">
                  <span className="detail-label">Phone</span>
                  <p>{hotspot.phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="details-actions">
            {hotspot.website && (
              <a href={hotspot.website} target="_blank" rel="noopener noreferrer" className="action-btn primary-btn" aria-label="Visit website">
                🌐 Visit Website
              </a>
            )}
            <a href={`https://www.openstreetmap.org/?mlat=${hotspot.lat}&mlon=${hotspot.lon}#map=17/${hotspot.lat}/${hotspot.lon}`} target="_blank" rel="noopener noreferrer" className="action-btn secondary-btn" aria-label="View on OpenStreetMap">
              🗺️ View on Map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

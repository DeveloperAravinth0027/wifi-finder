import React from 'react';
import './LoadingOverlay.css';

export default function LoadingOverlay({ message = 'Finding Wi-Fi hotspots…' }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-content">
        {/* Wi-Fi wave animation */}
        <div className="wifi-animation" aria-hidden="true">
          <div className="wifi-dot"></div>
          <div className="wifi-arc wifi-arc-1"></div>
          <div className="wifi-arc wifi-arc-2"></div>
          <div className="wifi-arc wifi-arc-3"></div>
        </div>
        <h2 className="loading-title">Wi-Fi Finder</h2>
        <p className="loading-message">{message}</p>
        <div className="loading-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

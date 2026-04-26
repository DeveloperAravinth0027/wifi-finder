import React, { useState, useEffect } from 'react';
import './WelcomeScreen.css';

export default function WelcomeScreen({ onComplete }) {
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    // Stage 1: Wait for intro animation
    const timer = setTimeout(() => {
      setShouldExit(true);
    }, 2500);

    // Stage 2: Trigger the onComplete callback after fade out
    const exitTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div className={`welcome-overlay ${shouldExit ? 'welcome-overlay--exit' : ''}`}>
      <div className="welcome-content">
        <div className="welcome-logo-container">
          <div className="welcome-icon-pulse"></div>
          <span className="welcome-logo" role="img" aria-label="Wi-Fi Logo">📡</span>
        </div>
        
        <div className="welcome-text-reveal">
          <h1 className="welcome-title">Wi-Fi Finder</h1>
          <div className="welcome-loader-bar">
            <div className="welcome-loader-progress"></div>
          </div>
          <p className="welcome-subtitle">Locating high-speed hotspots...</p>
        </div>
      </div>
    
      <div className="welcome-footer">
        <p>INITIALIZING PROJECT v1.0</p>
      </div>
    </div>
  );
}

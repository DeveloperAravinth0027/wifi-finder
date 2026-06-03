import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCategoryLabel } from '../utils/overpass';
import { formatDistance } from '../utils/distance';
import './MapView.css';

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

const CATEGORY_EMOJIS = {
  cafe: '☕',
  restaurant: '🍔',
  library: '📚',
  coworking: '💻',
  airport: '✈️',
  hotel: '🏨',
  shop: '🛍️',
  hotspot: '📡',
};

/**
 * Create a custom SVG DivIcon for each hotspot category
 */
function createHotspotIcon(category, isActive) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.hotspot;
  const emoji = CATEGORY_EMOJIS[category] || '📡';
  const size = isActive ? 44 : 36;

  const svg = `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 44 52" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
      <circle cx="22" cy="22" r="${isActive ? 20 : 17}" fill="${color}" filter="url(#shadow)" opacity="${isActive ? 1 : 0.92}"/>
      <circle cx="22" cy="22" r="${isActive ? 22 : 19}" fill="none" stroke="${color}" stroke-width="2" opacity="0.35"/>
      <text x="22" y="27" text-anchor="middle" font-size="14">${emoji}</text>
      <polygon points="22,${isActive ? 46 : 42} 16,${isActive ? 36 : 32} 28,${isActive ? 36 : 32}" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
    className: `hotspot-icon ${isActive ? 'hotspot-icon--active' : ''}`,
  });
}

/**
 * Creates the user location icon (pulsing blue dot)
 */
function createUserIcon() {
  return L.divIcon({
    html: `
      <div class="user-marker">
        <div class="user-marker-dot"></div>
        <div class="user-marker-pulse"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: '',
  });
}

/**
 * Inner component to fly/pan map when coords change
 */
function MapController({ coords, selectedHotspot }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (coords && !hasCenteredRef.current) {
      map.flyTo([coords.lat, coords.lon], 14, { animate: true, duration: 1.5 });
      hasCenteredRef.current = true;
    }
  }, [coords, map]);

  useEffect(() => {
    if (selectedHotspot) {
      map.flyTo([selectedHotspot.lat, selectedHotspot.lon], 16, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedHotspot, map]);

  return null;
}

export default function MapView({
  coords,
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  radius,
}) {
  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="leaflet-map"
        zoomControl={false}
        attributionControl={true}
      >
        {/* Dark-themed OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <ZoomControl position="bottomright" />
        <MapController coords={coords} selectedHotspot={selectedHotspot} />

        {/* User location marker + accuracy circle */}
        {coords && (
          <>
            <Marker
              position={[coords.lat, coords.lon]}
              icon={createUserIcon()}
              zIndexOffset={1000}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <strong>📍 You are here</strong>
                  <p>
                    {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                  </p>
                  {coords.accuracy && (
                    <p className="popup-accuracy">
                      Accuracy: ±{Math.round(coords.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Search radius circle */}
            <Circle
              center={[coords.lat, coords.lon]}
              radius={radius}
              pathOptions={{
                color: '#63b3ed',
                fillColor: '#63b3ed',
                fillOpacity: 0.04,
                weight: 1.5,
                dashArray: '6 4',
              }}
            />
          </>
        )}

        {/* Hotspot markers */}
        {hotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            position={[hotspot.lat, hotspot.lon]}
            icon={createHotspotIcon(
              hotspot.category,
              selectedHotspot?.id === hotspot.id
            )}
            eventHandlers={{
              click: () => onSelectHotspot(hotspot),
            }}
            zIndexOffset={selectedHotspot?.id === hotspot.id ? 500 : 0}
          >
            <Popup className="custom-popup" maxWidth={240}>
              <div className="popup-content">
                <strong className="popup-name">{hotspot.name}</strong>
                <span className="popup-category">
                  {getCategoryLabel(hotspot.category)}
                </span>
                {hotspot.address && (
                  <p className="popup-address">📍 {hotspot.address}</p>
                )}
                <span className="popup-wifi">{hotspot.wifiInfo}</span>
                {hotspot.distance !== undefined && (
                  <span className="popup-dist">
                    {formatDistance(hotspot.distance)} away
                  </span>
                )}
                {hotspot.openingHours && (
                  <p className="popup-hours">🕐 {hotspot.openingHours}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

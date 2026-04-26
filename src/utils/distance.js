/**
 * Haversine formula to compute great-circle distance between two coordinates
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Format a distance in km into a human-readable string
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Sort hotspots by distance from user coordinates
 * @param {Array} hotspots
 * @param {number} userLat
 * @param {number} userLon
 * @returns {Array} Sorted hotspots with distance field added
 */
export function sortByDistance(hotspots, userLat, userLon) {
  return hotspots
    .map((h) => ({
      ...h,
      distance: haversineDistance(userLat, userLon, h.lat, h.lon),
    }))
    .sort((a, b) => a.distance - b.distance);
}

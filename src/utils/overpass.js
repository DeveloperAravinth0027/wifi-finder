/**
 * Overpass API utilities for fetching Wi-Fi hotspot data from OpenStreetMap
 */

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

/**
 * Build an Overpass QL query to find Wi-Fi hotspots within a radius
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radiusMeters - Search radius in meters
 * @returns {string} Overpass QL query string
 */
export function buildQuery(lat, lon, radiusMeters) {
  return `
    [out:json][timeout:25];
    (
      node["internet_access"="wlan"](around:${radiusMeters},${lat},${lon});
      way["internet_access"="wlan"](around:${radiusMeters},${lat},${lon});
      node["amenity"~"cafe|restaurant|library|fast_food|pub|bar|food_court"]["internet_access"!="no"](around:${radiusMeters},${lat},${lon});
      node["office"~"coworking|it"]["internet_access"!="no"](around:${radiusMeters},${lat},${lon});
      node["aeroway"="aerodrome"](around:${radiusMeters},${lat},${lon});
      node["amenity"="airport"](around:${radiusMeters},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `.trim();
}

/**
 * Determine the category of a hotspot from OSM tags
 */
function getCategory(tags) {
  const amenity = tags.amenity || '';
  const office = tags.office || '';
  const aeroway = tags.aeroway || '';
  const shop = tags.shop || '';
  const tourism = tags.tourism || '';

  if (aeroway === 'aerodrome' || amenity === 'airport') return 'airport';
  if (amenity === 'library') return 'library';
  if (office === 'coworking' || office === 'it') return 'coworking';
  if (['cafe', 'coffee_shop'].includes(amenity)) return 'cafe';
  if (['restaurant', 'fast_food', 'food_court', 'pub', 'bar'].includes(amenity)) return 'restaurant';
  if (shop === 'mall' || shop === 'convenience') return 'shop';
  if (tourism === 'hotel' || tourism === 'hostel') return 'hotel';
  return 'hotspot';
}

/**
 * Get a human-readable label from a category
 */
export function getCategoryLabel(category) {
  const labels = {
    cafe: '☕ Café',
    restaurant: '🍔 Restaurant',
    library: '📚 Library',
    coworking: '💻 Coworking',
    airport: '✈️ Airport',
    hotel: '🏨 Hotel',
    shop: '🛍️ Shop',
    hotspot: '📡 Wi-Fi Hotspot',
  };
  return labels[category] || '📡 Wi-Fi Hotspot';
}

/**
 * Get the display name for a hotspot from OSM tags
 */
function getName(tags) {
  return (
    tags.name ||
    tags['name:en'] ||
    tags.brand ||
    tags.operator ||
    getCategoryLabel(getCategory(tags))
  );
}

/**
 * Build a human-readable address from OSM tags
 */
function getAddress(tags) {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'],
    tags['addr:country'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : tags['addr:full'] || null;
}

/**
 * Get Wi-Fi quality/type info from tags
 */
function getWifiInfo(tags) {
  const fee = tags['internet_access:fee'];
  if (fee === 'no') return 'Free Wi-Fi';
  if (fee === 'yes') return 'Paid Wi-Fi';
  if (tags['internet_access'] === 'wlan') return 'Wi-Fi Available';
  return 'Wi-Fi Likely';
}

/**
 * Parse raw Overpass API response into normalized hotspot objects
 * @param {object} data - Raw Overpass API response
 * @param {number} userLat - User's latitude (for deduplication center)
 * @param {number} userLon - User's longitude
 * @returns {Array} Normalized hotspot array
 */
export function parseResponse(data, userLat, userLon) {
  if (!data || !data.elements) return [];

  const seen = new Set();
  const hotspots = [];

  for (const element of data.elements) {
    if (!element.tags) continue;
    if (element.type === 'way' && !element.center) continue;

    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (!lat || !lon) continue;

    const name = getName(element.tags);
    const key = `${name}-${Math.round(lat * 1000)}-${Math.round(lon * 1000)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    hotspots.push({
      id: element.id,
      name,
      category: getCategory(element.tags),
      address: getAddress(element.tags),
      lat,
      lon,
      wifiInfo: getWifiInfo(element.tags),
      openingHours: element.tags.opening_hours || null,
      phone: element.tags.phone || element.tags['contact:phone'] || null,
      website: element.tags.website || element.tags['contact:website'] || null,
      tags: element.tags,
    });
  }

  return hotspots;
}

/**
 * Fetch hotspot data from Overpass API
 * @param {number} lat
 * @param {number} lon
 * @param {number} radiusMeters
 * @returns {Promise<Array>} Array of normalized hotspot objects
 */
export async function fetchHotspots(lat, lon, radiusMeters) {
  const query = buildQuery(lat, lon, radiusMeters);
  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return parseResponse(data, lat, lon);
}

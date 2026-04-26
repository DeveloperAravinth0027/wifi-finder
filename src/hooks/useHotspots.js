import { useState, useEffect, useCallback } from 'react';
import { fetchHotspots } from '../utils/overpass';
import { sortByDistance } from '../utils/distance';

/**
 * Hook to fetch and manage Wi-Fi hotspot data from the Overpass API
 * @param {object|null} coords - { lat, lon } user coordinates
 * @param {number} radiusMeters - Search radius in meters
 * @returns {{ hotspots, loading, error, refetch }}
 */
export function useHotspots(coords, radiusMeters = 2000) {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setFetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchHotspots(coords.lat, coords.lon, radiusMeters);
        if (!cancelled) {
          const sorted = sortByDistance(raw, coords.lat, coords.lon);
          setHotspots(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Failed to fetch Wi-Fi hotspots. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [coords, radiusMeters, fetchTrigger]);

  return { hotspots, loading, error, refetch };
}

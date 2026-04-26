import { useState, useEffect } from 'react';

/**
 * Hook to get the user's current geolocation
 * @param {object} options - Geolocation options
 * @returns {{ coords, loading, error, permissionDenied, retry }}
 */
export function useGeolocation(options = {}) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    };

    const onSuccess = (position) => {
      setCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
      setLoading(false);
      setError(null);
      setPermissionDenied(false);
    };

    const onError = (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionDenied(true);
        setError('Location access was denied. Please enable it in your browser settings.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setError('Location information is unavailable. Try again.');
      } else if (err.code === err.TIMEOUT) {
        setError('Location request timed out. Try again.');
      } else {
        setError('An unknown error occurred getting your location.');
      }
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, defaultOptions);
  }, [retryTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = () => setRetryTrigger((n) => n + 1);

  return { coords, loading, error, permissionDenied, retry };
}

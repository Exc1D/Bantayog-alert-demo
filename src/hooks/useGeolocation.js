import { useState, useEffect, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getPosition = useCallback((options = {}) => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  }), []);

  const toLocation = (position) => ({
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy
  });

  const requestLocation = useCallback(async (isManualRefresh = false) => {
    setLoading(true);

    const attempts = [
      { enableHighAccuracy: true, timeout: 15000, maximumAge: isManualRefresh ? 0 : 30000 },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 }
    ];

    for (let i = 0; i < attempts.length; i += 1) {
      try {
        const position = await getPosition(attempts[i]);
        setLocation(toLocation(position));
        setError(null);
        setLoading(false);
        return;
      } catch (err) {
        if (i === attempts.length - 1) {
          setError(err?.message || 'Unable to get your location.');
          setLoading(false);
        }
      }
    }
  }, [getPosition]);

  useEffect(() => {
    requestLocation(false);
  }, [requestLocation]);

  const refresh = useCallback(() => {
    requestLocation(true);
  }, [requestLocation]);

  return { location, error, loading, refresh };
}

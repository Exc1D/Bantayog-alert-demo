import { useState, useEffect, useCallback } from 'react';

function detectInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|Twitter|Snapchat|MicroMessenger|WebView/i.test(ua);
}

const IN_APP_DETECTED = detectInAppBrowser();

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(
    IN_APP_DETECTED
      ? 'GPS is usually unavailable in this browser. Select your municipality below, or open this page in Chrome/Safari for GPS.'
      : null
  );
  const [loading, setLoading] = useState(!IN_APP_DETECTED);
  const [isInApp] = useState(IN_APP_DETECTED);

  const getPosition = useCallback(
    (options = {}) =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      }),
    []
  );

  const toLocation = (position) => ({
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  });

  const requestLocation = useCallback(
    async (isManualRefresh = false) => {
      setLoading(true);

      // In-app browsers: use shorter timeouts since GPS almost never works
      const attempts = IN_APP_DETECTED
        ? [{ enableHighAccuracy: false, timeout: 5000, maximumAge: 120000 }]
        : [
            { enableHighAccuracy: true, timeout: 15000, maximumAge: isManualRefresh ? 0 : 30000 },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 },
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
            if (IN_APP_DETECTED) {
              setError(
                'GPS is usually unavailable in this browser. Select your municipality below, or open this page in Chrome/Safari for GPS.'
              );
            } else {
              setError(err?.message || 'Unable to get your location.');
            }
            setLoading(false);
          }
        }
      }
    },
    [getPosition]
  );

  useEffect(() => {
    // Still attempt GPS even in in-app browsers — it works for a small
    // minority of devices.  The UI already shows the manual fallback so
    // the user isn't blocked waiting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    requestLocation(false);
  }, [requestLocation]);

  const refresh = useCallback(() => {
    requestLocation(true);
  }, [requestLocation]);

  return { location, error, loading, refresh, isInApp };
}

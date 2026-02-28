import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MUNICIPALITY_BOUNDS } from '../../utils/constants';

/**
 * Component that automatically reorients the map to show the entire
 * selected municipality when the municipality filter changes.
 */
export default function MapFlyToLocation({ municipality }) {
  const map = useMap();
  const prevMunicipalityRef = useRef(null);

  useEffect(() => {
    // Skip if municipality is 'all' or hasn't changed
    if (!municipality || municipality === 'all') {
      prevMunicipalityRef.current = null;
      return;
    }

    // Skip if municipality hasn't actually changed
    if (prevMunicipalityRef.current === municipality) {
      return;
    }

    // Get bounds for the selected municipality
    const bounds = MUNICIPALITY_BOUNDS[municipality];

    // Handle unknown municipality - log warning and skip
    if (!bounds) {
      console.warn(
        `MapFlyToLocation: No bounds found for municipality "${municipality}". ` +
          'Verify the municipality is defined in MUNICIPALITY_BOUNDS.'
      );
      return;
    }

    // Only update ref after confirming bounds exist to avoid locking in unsupported values
    prevMunicipalityRef.current = municipality;

    // Fit the map to show the entire municipality
    // padding: [50, 50] adds margin around the bounds
    // maxZoom: 14 prevents zooming in too close
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 14,
      animate: true,
      duration: 1, // smooth animation duration in seconds
    });
  }, [municipality, map]);

  return null;
}

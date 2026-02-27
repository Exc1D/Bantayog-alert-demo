import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from './MarkerClusterGroup';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DisasterMarker from './DisasterMarker';
import MapControls from './MapControls';
import { MAP_CENTER, MAP_ZOOM, MAP_MAX_ZOOM, MAP_MIN_ZOOM } from '../../utils/constants';

// Fix default marker icon issue in Leaflet + Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Tile providers with fallbacks
const TILE_PROVIDERS = [
  {
    name: 'openstreetmap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    name: 'cartodb-light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
];

function flyToCurrentPosition(map) {
  navigator.geolocation.getCurrentPosition(
    (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15),
    () => {},
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// Captures the Leaflet map instance into a ref so it can be used outside MapContainer
function MapRefCapture({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

// Component to handle tile errors and switch providers
function TileErrorHandler({ onTileError }) {
  useMapEvents({
    tileerror: (e) => {
      console.warn('Tile loading error:', e.tile?.src);
      onTileError?.();
    },
  });
  return null;
}

// Component to handle map resize when container size changes
function MapResizeHandler() {
  const map = useMap();
  const containerRef = useRef(null);

  useEffect(() => {
    // Get the map container element
    const container = map.getContainer();
    containerRef.current = container;

    // Use requestAnimationFrame for initial sizing - more reliable than setTimeout
    let rafId = requestAnimationFrame(() => {
      map.invalidateSize();
    });

    // Debounce helper for resize events
    let resizeTimeout = null;
    const debouncedResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        map.invalidateSize();
      }, 150);
    };

    // Use ResizeObserver to watch for container size changes (more efficient than window resize)
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(container);
    }

    // Also listen for window resize as fallback (with debounce)
    window.addEventListener('resize', debouncedResize);

    return () => {
      cancelAnimationFrame(rafId);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', debouncedResize);
    };
  }, [map]);

  return null;
}

export default function LeafletMap({ reports = [], onReportClick }) {
  const mapRef = useRef(null);
  const [currentTileIndex, setCurrentTileIndex] = useState(0);

  const [filters, setFilters] = useState({
    municipality: 'all',
  });

  // Switch to fallback tile provider after multiple errors
  const handleTileError = useCallback(() => {
    setCurrentTileIndex((prevIndex) => {
      if (prevIndex < TILE_PROVIDERS.length - 1) {
        console.warn('Switching to fallback tile provider:', TILE_PROVIDERS[prevIndex + 1].name);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, []);

  const currentTile = TILE_PROVIDERS[currentTileIndex];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (filters.municipality !== 'all' && report.location?.municipality !== filters.municipality)
        return false;
      return true;
    });
  }, [reports, filters]);

  const handleMarkerClick = useCallback(
    (report) => {
      if (onReportClick) onReportClick(report);
    },
    [onReportClick]
  );

  const handleLocate = () => {
    if (mapRef.current) flyToCurrentPosition(mapRef.current);
  };

  return (
    <div className="relative w-full h-full">
      <MapControls
        filters={filters}
        onFilterChange={setFilters}
        reportCount={filteredReports.length}
      />

      {/* Location button — rendered outside MapContainer for precise positioning */}
      <button
        onClick={handleLocate}
        className="absolute z-[1000] flex items-center justify-center bg-white text-primary rounded-lg shadow-dark hover:bg-stone-50 active:bg-stone-100 transition-colors"
        style={{ bottom: '10px', left: '10px', width: '40px', height: '40px' }}
        aria-label="My Location"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Zoom controls — bottomleft, CSS pushes them above the location button */}
        <ZoomControl position="bottomleft" />
        <MapResizeHandler />
        <TileLayer
          key={currentTile.name}
          attribution={currentTile.attribution}
          url={currentTile.url}
          keepBuffer={8}
          updateWhenZooming={false}
          updateWhenIdle={true}
          maxZoom={MAP_MAX_ZOOM}
          minZoom={MAP_MIN_ZOOM}
          crossOrigin="anonymous"
        />
        <TileErrorHandler onTileError={handleTileError} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          disableClusteringAtZoom={16}
        >
          {filteredReports.map((report) => (
            <DisasterMarker key={report.id} report={report} onClick={handleMarkerClick} />
          ))}
        </MarkerClusterGroup>

        <MapRefCapture mapRef={mapRef} />
      </MapContainer>
    </div>
  );
}

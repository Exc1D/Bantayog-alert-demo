import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
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

export default function LeafletMap({ reports = [], onReportClick }) {
  const mapRef = useRef(null);

  const [filters, setFilters] = useState({
    municipality: 'all',
  });

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />

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

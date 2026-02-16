import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

function flyToCurrentPosition(map) {
  navigator.geolocation.getCurrentPosition(
    (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15),
    () => {},
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function LocateOnMount() {
  const map = useMap();

  useEffect(() => {
    if (navigator.geolocation) {
      flyToCurrentPosition(map);
    }
  }, [map]);

  return null;
}

function LocationButton() {
  const map = useMap();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(buttonRef.current);
    }
  }, []);

  const handleLocate = () => {
    flyToCurrentPosition(map);
  };

  return (
    <div className="leaflet-bottom leaflet-left z-[1000]" style={{ marginBottom: '20px', marginLeft: '12px' }}>
      <button
        ref={buttonRef}
        onClick={handleLocate}
        className="flex items-center gap-1.5 bg-primary text-white rounded-lg shadow-dark px-3 py-2.5 hover:bg-secondary transition-colors font-medium text-xs"
        title="My Location"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        <span>My Location</span>
      </button>
    </div>
  );
}

export default function LeafletMap({ reports = [], onReportClick }) {
  const [filters, setFilters] = useState({
    municipality: 'all'
  });

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filters.municipality !== 'all' && report.location?.municipality !== filters.municipality) return false;
      return true;
    });
  }, [reports, filters]);

  const handleMarkerClick = useCallback((report) => {
    if (onReportClick) onReportClick(report);
  }, [onReportClick]);

  return (
    <div className="relative w-full h-full">
      <MapControls
        filters={filters}
        onFilterChange={setFilters}
        reportCount={filteredReports.length}
      />

      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        minZoom={MAP_MIN_ZOOM}
        className="w-full h-full"
        zoomControl={true}
      >
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
            <DisasterMarker
              key={report.id}
              report={report}
              onClick={handleMarkerClick}
            />
          ))}
        </MarkerClusterGroup>

        <LocateOnMount />
        <LocationButton />
      </MapContainer>
    </div>
  );
}

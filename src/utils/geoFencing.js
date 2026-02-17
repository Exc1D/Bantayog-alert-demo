import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import centroid from '@turf/centroid';
import distance from '@turf/distance';
import boundariesData from '../data/camarines-norte-boundaries.json';
import { MUNICIPALITY_COORDS } from './constants';

const BARANGAY_MUNICIPALITY_OVERRIDES = {
  maslog: 'San Lorenzo Ruiz'
};

function normalizeBarangay(value) {
  return String(value || '').trim().toLowerCase();
}

export function detectMunicipality(lat, lng, options = {}) {
  if (!lat || !lng) return null;

  // Turf uses [longitude, latitude] order
  const pt = point([lng, lat]);
  const matches = [];

  for (const feature of boundariesData.features) {
    if (booleanPointInPolygon(pt, feature)) {
      matches.push(feature.properties.name);
    }
  }

  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];

  // If barangay is known, use explicit mapping to break overlap ties.
  const override = BARANGAY_MUNICIPALITY_OVERRIDES[normalizeBarangay(options.barangay)];
  if (override && matches.includes(override)) return override;

  // Fallback: choose nearest municipality reference point among overlapping polygons.
  let nearest = matches[0];
  let minDistance = Infinity;
  for (const municipality of matches) {
    const coords = MUNICIPALITY_COORDS[municipality];
    if (!coords) continue;
    const dist = distance(pt, point([coords.lng, coords.lat]), { units: 'kilometers' });
    if (dist < minDistance) {
      minDistance = dist;
      nearest = municipality;
    }
  }

  return nearest;
}

export function isInCamarinesNorte(lat, lng) {
  return detectMunicipality(lat, lng) !== null;
}

export function getNearestMunicipality(lat, lng) {
  if (!lat || !lng) return null;

  const pt = point([lng, lat]);
  let nearest = null;
  let minDistance = Infinity;

  for (const feature of boundariesData.features) {
    const center = centroid(feature);
    const dist = distance(pt, center, { units: 'kilometers' });

    if (dist < minDistance) {
      minDistance = dist;
      nearest = feature.properties.name;
    }
  }

  return nearest;
}

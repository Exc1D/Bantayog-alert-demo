import * as turf from '@turf/turf';
import boundariesData from '../data/camarines-norte-boundaries.json';

export function detectMunicipality(lat, lng) {
  if (!lat || !lng) return null;

  // Turf uses [longitude, latitude] order
  const point = turf.point([lng, lat]);

  for (const feature of boundariesData.features) {
    if (turf.booleanPointInPolygon(point, feature)) {
      return feature.properties.name;
    }
  }

  // Point is outside Camarines Norte
  return null;
}

export function isInCamarinesNorte(lat, lng) {
  return detectMunicipality(lat, lng) !== null;
}

export function getNearestMunicipality(lat, lng) {
  if (!lat || !lng) return null;

  const point = turf.point([lng, lat]);
  let nearest = null;
  let minDistance = Infinity;

  for (const feature of boundariesData.features) {
    const center = turf.centroid(feature);
    const distance = turf.distance(point, center, { units: 'kilometers' });

    if (distance < minDistance) {
      minDistance = distance;
      nearest = feature.properties.name;
    }
  }

  return nearest;
}

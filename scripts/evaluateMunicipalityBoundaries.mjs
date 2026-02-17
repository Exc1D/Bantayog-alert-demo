import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { MUNICIPALITY_COORDS } from '../src/utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const boundaries = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/camarines-norte-boundaries.json'), 'utf8')
);

const features = boundaries.features;

const BARANGAY_MUNICIPALITY_OVERRIDES = {
  maslog: 'San Lorenzo Ruiz'
};

function normalizeBarangay(value) {
  return String(value || '').trim().toLowerCase();
}

function detectMunicipality(lat, lng, options = {}) {
  const pt = point([lng, lat]);
  const matches = [];

  for (const feature of features) {
    if (booleanPointInPolygon(pt, feature)) {
      matches.push(feature.properties.name);
    }
  }

  if (!matches.length) return null;
  if (matches.length === 1) return matches[0];

  const override = BARANGAY_MUNICIPALITY_OVERRIDES[normalizeBarangay(options.barangay)];
  if (override && matches.includes(override)) return override;

  let nearest = matches[0];
  let minDistance = Infinity;
  for (const municipality of matches) {
    const coords = MUNICIPALITY_COORDS[municipality];
    if (!coords) continue;
    const dist = Math.hypot(lng - coords.lng, lat - coords.lat);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = municipality;
    }
  }

  return nearest;
}

function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

const allLng = [];
const allLat = [];
for (const f of features) {
  for (const ring of f.geometry.coordinates) {
    for (const [lng, lat] of ring) {
      allLng.push(lng);
      allLat.push(lat);
    }
  }
}

const bbox = {
  minLng: Math.min(...allLng),
  maxLng: Math.max(...allLng),
  minLat: Math.min(...allLat),
  maxLat: Math.max(...allLat)
};

const gridSize = 260;
let overlapPoints = 0;
let uncoveredPoints = 0;
let coveredPoints = 0;
let total = 0;
const pairOverlaps = new Map();

for (let xi = 0; xi < gridSize; xi += 1) {
  const lng = bbox.minLng + ((bbox.maxLng - bbox.minLng) * xi) / (gridSize - 1);
  for (let yi = 0; yi < gridSize; yi += 1) {
    const lat = bbox.minLat + ((bbox.maxLat - bbox.minLat) * yi) / (gridSize - 1);
    total += 1;
    const pt = point([lng, lat]);
    const matches = [];

    for (const feature of features) {
      if (booleanPointInPolygon(pt, feature)) matches.push(feature.properties.name);
    }

    if (matches.length === 0) uncoveredPoints += 1;
    else coveredPoints += 1;

    if (matches.length > 1) {
      overlapPoints += 1;
      for (let i = 0; i < matches.length; i += 1) {
        for (let j = i + 1; j < matches.length; j += 1) {
          const key = [matches[i], matches[j]].sort().join(' | ');
          pairOverlaps.set(key, (pairOverlaps.get(key) || 0) + 1);
        }
      }
    }
  }
}

const coordChecks = Object.entries(MUNICIPALITY_COORDS).map(([name, coord]) => {
  const detected = detectMunicipality(coord.lat, coord.lng);
  return {
    municipality: name,
    detected,
    matched: detected === name,
    lat: coord.lat,
    lng: coord.lng
  };
});

const geometryChecks = features.map((feature) => {
  const ring = feature.geometry.coordinates[0];
  const first = ring[0];
  const last = ring[ring.length - 1];
  return {
    municipality: feature.properties.name,
    closed: first[0] === last[0] && first[1] === last[1],
    vertices: ring.length,
    planarAreaDeg2: polygonArea(ring)
  };
});


const overlapTieBreakCheck = {
  description: 'Overlap tie-break with barangay=Maslog should resolve to San Lorenzo Ruiz',
  input: { lat: 14.035, lng: 122.89, barangay: 'Maslog' },
  overlappingMatches: features
    .filter((feature) => booleanPointInPolygon(point([122.89, 14.035]), feature))
    .map((feature) => feature.properties.name)
};

overlapTieBreakCheck.detectedWithoutBarangay = detectMunicipality(
  overlapTieBreakCheck.input.lat,
  overlapTieBreakCheck.input.lng
);
overlapTieBreakCheck.detectedWithBarangay = detectMunicipality(
  overlapTieBreakCheck.input.lat,
  overlapTieBreakCheck.input.lng,
  { barangay: overlapTieBreakCheck.input.barangay }
);

const sortedPairOverlaps = [...pairOverlaps.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([pair, count]) => ({ pair, count }));

console.log(JSON.stringify({
  featureCount: features.length,
  bbox,
  gridSize,
  samplePoints: total,
  coverageRatio: coveredPoints / total,
  uncoveredRatio: uncoveredPoints / total,
  overlapRatio: overlapPoints / total,
  centroidMatchCount: coordChecks.filter((c) => c.matched).length,
  coordChecks,
  geometryChecks,
  topOverlapPairs: sortedPairOverlaps,
  overlapTieBreakCheck
}, null, 2));

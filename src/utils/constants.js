export const MAP_CENTER = [14.11, 122.96];
export const MAP_ZOOM = 10;
export const MAP_MAX_ZOOM = 18;
export const MAP_MIN_ZOOM = 8;

export const PROVINCE = 'Camarines Norte';
export const TIMEZONE = 'Asia/Manila';

const MUNICIPALITY_DATA = [
  {
    name: 'Basud',
    lat: 14.0669,
    lng: 122.9686,
    bounds: [
      [13.98, 122.88],
      [14.12, 123.05],
    ],
  },
  {
    name: 'Capalonga',
    lat: 14.3333,
    lng: 122.4833,
    bounds: [
      [14.25, 122.35],
      [14.42, 122.58],
    ],
  },
  {
    name: 'Daet',
    lat: 14.1122,
    lng: 122.9553,
    bounds: [
      [14.06, 122.88],
      [14.18, 123.05],
    ],
  },
  {
    name: 'Jose Panganiban',
    lat: 14.2944,
    lng: 122.6931,
    bounds: [
      [14.22, 122.6],
      [14.37, 122.78],
    ],
  },
  {
    name: 'Labo',
    lat: 14.15,
    lng: 122.8,
    bounds: [
      [14.03, 122.65],
      [14.25, 122.92],
    ],
  },
  {
    name: 'Mercedes',
    lat: 14.1167,
    lng: 123.0167,
    bounds: [
      [14.06, 122.95],
      [14.18, 123.12],
    ],
  },
  {
    name: 'Paracale',
    lat: 14.2833,
    lng: 122.7333,
    bounds: [
      [14.22, 122.67],
      [14.35, 122.82],
    ],
  },
  {
    name: 'San Lorenzo Ruiz',
    lat: 14.0833,
    lng: 122.85,
    bounds: [
      [14.02, 122.78],
      [14.13, 122.93],
    ],
  },
  {
    name: 'San Vicente',
    lat: 14.1,
    lng: 122.8833,
    bounds: [
      [14.04, 122.82],
      [14.15, 122.95],
    ],
  },
  {
    name: 'Santa Elena',
    lat: 14.1667,
    lng: 122.4667,
    bounds: [
      [14.08, 122.35],
      [14.25, 122.58],
    ],
  },
  {
    name: 'Talisay',
    lat: 14.1333,
    lng: 122.9333,
    bounds: [
      [14.07, 122.86],
      [14.18, 122.97],
    ],
  },
  {
    name: 'Vinzons',
    lat: 14.1833,
    lng: 122.9167,
    bounds: [
      [14.14, 122.83],
      [14.25, 122.98],
    ],
  },
];

export const MUNICIPALITIES = MUNICIPALITY_DATA.map((m) => m.name);

export const MUNICIPALITY_COORDS = MUNICIPALITY_DATA.reduce((acc, m) => {
  acc[m.name] = { lat: m.lat, lng: m.lng };
  return acc;
}, {});

export const MUNICIPALITY_BOUNDS = MUNICIPALITY_DATA.reduce((acc, m) => {
  acc[m.name] = m.bounds;
  return acc;
}, {});

export const SEVERITY_COLORS = {
  minor: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
  moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  default: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
};

export const SEVERITY_LEVELS = Object.keys(SEVERITY_COLORS).filter((k) => k !== 'default');

export const SEVERITY_OPTIONS = [
  {
    id: 'critical',
    label: 'Critical',
    icon: '\u{1F534}',
    description: 'Immediate danger or life-threatening',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    icon: '\u{1F7E0}',
    description: 'Significant impact but manageable',
  },
  { id: 'minor', label: 'Minor', icon: '\u{1F7E2}', description: 'Low impact, informational' },
];

export const STATUS_COLORS = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
  verified: { bg: 'bg-blue-100', text: 'text-blue-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800' },
};

export const MARKER_COLORS = {
  flood: '#3b82f6',
  landslide: '#a16207',
  fire: '#ef4444',
  earthquake: '#7c3aed',
  typhoon: '#06b6d4',
  health: '#ec4899',
  road_incident: '#f97316',
  infrastructure: '#64748b',
  environmental: '#10b981',
  security: '#f59e0b',
  other: '#6b7280',
  pending: '#9ca3af',
};

export const DISASTER_ICONS = {
  flood: '\u{1F30A}',
  landslide: '\u26F0\uFE0F',
  fire: '\u{1F525}',
  earthquake: '\u{1F3DA}\uFE0F',
  typhoon: '\u{1F300}',
  health: '\u{1F3E5}',
  road_incident: '\u{1F6B8}',
  infrastructure: '\u{1F6A7}',
  environmental: '\u{1F33F}',
  security: '\u{1F6A8}',
  other: '\u26A0\uFE0F',
  pending: '\u2753',
};

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_EVIDENCE = 5;
export const MAX_VIDEO_SIZE_MB = 50;
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
export const FEED_PAGE_SIZE = 10;

export const USER_ROLES = {
  CITIZEN: 'citizen',
  MUNICIPAL_ADMIN: 'admin_municipality',
  PROVINCIAL_ADMIN: 'superadmin_provincial',
};

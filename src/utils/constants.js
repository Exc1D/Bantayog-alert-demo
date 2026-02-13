export const MAP_CENTER = [14.1100, 122.9600];
export const MAP_ZOOM = 10;
export const MAP_MAX_ZOOM = 18;
export const MAP_MIN_ZOOM = 8;

export const PROVINCE = 'Camarines Norte';
export const TIMEZONE = 'Asia/Manila';

export const MUNICIPALITIES = [
  'Basud',
  'Capalonga',
  'Daet',
  'Jose Panganiban',
  'Labo',
  'Mercedes',
  'Paracale',
  'San Lorenzo Ruiz',
  'San Vicente',
  'Santa Elena',
  'Talisay',
  'Vinzons'
];

export const MUNICIPALITY_COORDS = {
  'Basud': { lat: 14.0669, lng: 122.9686 },
  'Capalonga': { lat: 14.3333, lng: 122.4833 },
  'Daet': { lat: 14.1122, lng: 122.9553 },
  'Jose Panganiban': { lat: 14.2944, lng: 122.6931 },
  'Labo': { lat: 14.1500, lng: 122.8000 },
  'Mercedes': { lat: 14.1167, lng: 123.0167 },
  'Paracale': { lat: 14.2833, lng: 122.7333 },
  'San Lorenzo Ruiz': { lat: 14.0833, lng: 122.8500 },
  'San Vicente': { lat: 14.1000, lng: 122.8833 },
  'Santa Elena': { lat: 14.1667, lng: 122.4667 },
  'Talisay': { lat: 14.1333, lng: 122.9333 },
  'Vinzons': { lat: 14.1833, lng: 122.9167 }
};

export const SEVERITY_LEVELS = ['minor', 'moderate', 'critical'];

export const SEVERITY_COLORS = {
  minor: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
  moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' }
};

export const STATUS_COLORS = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
  verified: { bg: 'bg-blue-100', text: 'text-blue-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800' }
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
  other: '#6b7280'
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
  other: '\u26A0\uFE0F'
};

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE_MB = 5;
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};

export const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
export const FEED_PAGE_SIZE = 10;

export const USER_ROLES = {
  CITIZEN: 'citizen',
  MUNICIPAL_ADMIN: 'admin_municipality',
  PROVINCIAL_ADMIN: 'superadmin_provincial'
};

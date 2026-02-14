export const DISASTER_TYPES = [
  {
    id: 'flood',
    label: 'Flooding',
    icon: '\u{1F30A}',
    color: '#3b82f6',
    description: 'Flash floods, river overflow, urban flooding',
    tags: ['impassable', 'rescue-needed', 'evacuation', 'power-outage', 'stranded-vehicles']
  },
  {
    id: 'landslide',
    label: 'Landslide',
    icon: '\u26F0\uFE0F',
    color: '#a16207',
    description: 'Mudslides, rockfalls, road blockages',
    tags: ['road-blocked', 'houses-buried', 'rescue-needed', 'evacuation']
  },
  {
    id: 'fire',
    label: 'Fire',
    icon: '\u{1F525}',
    color: '#ef4444',
    description: 'House fires, forest fires, building fires',
    tags: ['spreading', 'trapped-people', 'bfp-responding', 'evacuation']
  },
  {
    id: 'earthquake',
    label: 'Earthquake',
    icon: '\u{1F3DA}\uFE0F',
    color: '#7c3aed',
    description: 'Structural damage, ground shaking',
    tags: ['collapsed-structure', 'trapped-people', 'aftershock', 'cracked-roads']
  },
  {
    id: 'typhoon',
    label: 'Typhoon',
    icon: '\u{1F300}',
    color: '#06b6d4',
    description: 'Strong winds, storm damage, roof damage',
    tags: ['roof-damage', 'trees-down', 'power-outage', 'flooding', 'storm-surge']
  },
  {
    id: 'health',
    label: 'Health',
    icon: '\u{1F3E5}',
    color: '#ec4899',
    description: 'Disease outbreak, medical emergency',
    tags: ['outbreak', 'medical-emergency', 'hospital-needed', 'quarantine']
  },
  {
    id: 'road_incident',
    label: 'Road Incident',
    icon: '\u{1F6B8}',
    color: '#f97316',
    description: 'Collisions, accidents, vehicle malfunctions',
    tags: ['collision', 'road-blocked', 'injuries', 'pnp-responding']
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: '\u{1F6A7}',
    color: '#64748b',
    description: 'Road damage, bridge collapse, power outage',
    tags: ['road-damage', 'bridge-collapse', 'power-outage', 'water-supply']
  },
  {
    id: 'environmental',
    label: 'Environmental',
    icon: '\u{1F33F}',
    color: '#10b981',
    description: 'Pollution, chemical spill, hazardous waste',
    tags: ['pollution', 'chemical-spill', 'hazardous-waste', 'water-contamination']
  },
  {
    id: 'security',
    label: 'Security',
    icon: '\u{1F6A8}',
    color: '#f59e0b',
    description: 'Crime, violence, safety threats',
    tags: ['crime', 'violence', 'theft', 'pnp-responding']
  },
  {
    id: 'other',
    label: 'Other',
    icon: '\u26A0\uFE0F',
    color: '#6b7280',
    description: 'Uncategorized emergencies',
    tags: ['urgent', 'needs-attention']
  },
  {
    id: 'pending',
    label: 'Unclassified',
    icon: '\u26A0\uFE0F',
    color: '#9ca3af',
    description: 'Awaiting classification by admin',
    tags: []
  }
];

export function getDisasterType(id) {
  return DISASTER_TYPES.find(type => type.id === id) || DISASTER_TYPES[DISASTER_TYPES.length - 1];
}

export function getDisasterIcon(id) {
  const type = getDisasterType(id);
  return type.icon;
}

export function getDisasterColor(id) {
  const type = getDisasterType(id);
  return type.color;
}

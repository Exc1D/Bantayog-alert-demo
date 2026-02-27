export const mockUsers = {
  citizen: {
    uid: 'user-123',
    email: 'citizen@test.com',
    displayName: 'Juan Dela Cruz',
    isAnonymous: false,
    photoURL: null,
  },
  admin: {
    uid: 'admin-456',
    email: 'admin@test.com',
    displayName: 'Admin User',
    isAnonymous: false,
    photoURL: null,
  },
  guest: {
    uid: 'guest-789',
    isAnonymous: true,
  },
};

export const mockUserProfiles = {
  citizen: {
    userId: 'user-123',
    email: 'citizen@test.com',
    displayName: 'Juan Dela Cruz',
    photoURL: '',
    municipality: 'Laoag City',
    role: 'user',
    stats: {
      reportsSubmitted: 5,
      reportsVerified: 0,
      reportsResolved: 0,
      upvotesReceived: 12,
    },
  },
  admin: {
    userId: 'admin-456',
    email: 'admin@test.com',
    name: 'Admin User',
    photoURL: '',
    municipality: 'Laoag City',
    role: 'admin_laoag',
    stats: {
      reportsSubmitted: 0,
      reportsVerified: 25,
      reportsResolved: 18,
      upvotesReceived: 0,
    },
  },
};

export const mockReports = [
  {
    id: 'report-1',
    timestamp: { seconds: 1700000000, nanoseconds: 0 },
    reportType: 'situation',
    location: {
      lat: 18.1978,
      lng: 120.5939,
      municipality: 'Laoag City',
      barangay: 'Barangay 1',
      street: 'Rizal Street',
      accuracy: 10,
    },
    disaster: {
      type: 'flood',
      severity: 'moderate',
      description: 'Waist-deep flooding on main street',
      tags: ['urgent', 'ongoing'],
    },
    media: {
      photos: ['https://example.com/photo1.jpg'],
      videos: [],
      thumbnails: ['https://example.com/thumb1.jpg'],
    },
    reporter: {
      userId: 'user-123',
      name: 'Juan Dela Cruz',
      isAnonymous: false,
      isVerifiedUser: false,
    },
    verification: {
      status: 'pending',
      verifiedBy: null,
      verifiedAt: null,
      verifierRole: null,
      notes: '',
      resolution: {
        resolvedBy: null,
        resolvedAt: null,
        evidencePhotos: [],
        resolutionNotes: '',
        actionsTaken: '',
        resourcesUsed: '',
      },
    },
    engagement: {
      views: 45,
      upvotes: 12,
      upvotedBy: ['user-2', 'user-3'],
      commentCount: 3,
      shares: 2,
    },
    weatherContext: {
      temperature: 28,
      humidity: 85,
      condition: 'Rainy',
    },
  },
  {
    id: 'report-2',
    timestamp: { seconds: 1700001000, nanoseconds: 0 },
    reportType: 'alert',
    location: {
      lat: 18.185,
      lng: 120.58,
      municipality: 'Batac City',
      barangay: 'Barangay 5',
      street: '',
      accuracy: 15,
    },
    disaster: {
      type: 'fire',
      severity: 'critical',
      description: 'Structural fire in residential area',
      tags: ['critical', 'immediate'],
    },
    media: {
      photos: [],
      videos: [],
      thumbnails: [],
    },
    reporter: {
      userId: 'user-456',
      name: 'Maria Santos',
      isAnonymous: false,
      isVerifiedUser: true,
    },
    verification: {
      status: 'verified',
      verifiedBy: 'admin-456',
      verifiedAt: { seconds: 1700001500, nanoseconds: 0 },
      verifierRole: 'admin_batac',
      notes: 'Confirmed by local fire station',
      resolution: {
        resolvedBy: null,
        resolvedAt: null,
        evidencePhotos: [],
        resolutionNotes: '',
        actionsTaken: '',
        resourcesUsed: '',
      },
    },
    engagement: {
      views: 120,
      upvotes: 35,
      upvotedBy: ['user-1', 'user-2', 'user-3'],
      commentCount: 8,
      shares: 15,
    },
    weatherContext: {
      temperature: 32,
      humidity: 60,
      condition: 'Sunny',
    },
  },
];

export const mockWeather = {
  current: {
    temperature: 29,
    humidity: 78,
    condition: 'Partly Cloudy',
    windSpeed: 12,
    precipitation: 20,
    feelsLike: 32,
  },
  forecast: [
    {
      day: 'Monday',
      high: 31,
      low: 25,
      condition: 'Sunny',
      precipitation: 10,
    },
    {
      day: 'Tuesday',
      high: 30,
      low: 24,
      condition: 'Cloudy',
      precipitation: 30,
    },
    {
      day: 'Wednesday',
      high: 28,
      low: 23,
      condition: 'Rainy',
      precipitation: 80,
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'Thunderstorm Warning',
      severity: 'moderate',
      description: 'Possible thunderstorms in the afternoon',
      expiresAt: '2024-01-15T18:00:00Z',
    },
  ],
};

export const mockGeolocation = {
  position: {
    coords: {
      latitude: 18.1978,
      longitude: 120.5939,
      accuracy: 10,
    },
  },
  error: {
    code: 1,
    message: 'User denied Geolocation',
  },
};

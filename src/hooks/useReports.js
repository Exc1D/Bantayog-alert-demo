import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, serverTimestamp } from '../utils/firebaseConfig';
import { compressImage, createThumbnail } from '../utils/imageCompression';
import { fetchCurrentWeather } from '../utils/weatherAPI';
import { detectMunicipality } from '../utils/geoFencing';
import { FEED_PAGE_SIZE } from '../utils/constants';

export function useReports(filters = {}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'), limit(FEED_PAGE_SIZE));

    if (filters.type && filters.type !== 'all') {
      q = query(collection(db, 'reports'),
        where('disaster.type', '==', filters.type),
        orderBy('timestamp', 'desc'),
        limit(FEED_PAGE_SIZE)
      );
    }

    if (filters.status && filters.status !== 'all') {
      q = query(collection(db, 'reports'),
        where('verification.status', '==', filters.status),
        orderBy('timestamp', 'desc'),
        limit(FEED_PAGE_SIZE)
      );
    }

    if (filters.municipality && filters.municipality !== 'all') {
      q = query(collection(db, 'reports'),
        where('location.municipality', '==', filters.municipality),
        orderBy('timestamp', 'desc'),
        limit(FEED_PAGE_SIZE)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(docs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length >= FEED_PAGE_SIZE);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filters.type, filters.status, filters.municipality]);

  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;

    let q = query(
      collection(db, 'reports'),
      orderBy('timestamp', 'desc'),
      startAfter(lastDoc),
      limit(FEED_PAGE_SIZE)
    );

    const snapshot = await getDocs(q);
    const newDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    setReports(prev => [...prev, ...newDocs]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setHasMore(snapshot.docs.length >= FEED_PAGE_SIZE);
  }, [lastDoc, hasMore]);

  return { reports, loading, error, loadMore, hasMore };
}

export async function submitReport(reportData, photos, user) {
  try {
    // Upload photos
    const photoUrls = [];
    const thumbnailUrls = [];

    for (const photo of photos) {
      const compressed = await compressImage(photo);
      const thumbnail = await createThumbnail(photo);

      const photoRef = ref(storage, `reports/${Date.now()}_${photo.name}`);
      const thumbRef = ref(storage, `reports/thumbs/${Date.now()}_${photo.name}`);

      await uploadBytes(photoRef, compressed);
      await uploadBytes(thumbRef, thumbnail);

      const photoUrl = await getDownloadURL(photoRef);
      const thumbUrl = await getDownloadURL(thumbRef);

      photoUrls.push(photoUrl);
      thumbnailUrls.push(thumbUrl);
    }

    // Get weather context
    let weatherContext = {};
    try {
      weatherContext = await fetchCurrentWeather(
        reportData.location.lat,
        reportData.location.lng
      );
    } catch (e) {
      console.warn('Could not fetch weather context:', e);
    }

    // Detect municipality
    const municipality = detectMunicipality(
      reportData.location.lat,
      reportData.location.lng
    ) || reportData.location.municipality || 'Unknown';

    // Build report document
    const report = {
      timestamp: serverTimestamp(),
      location: {
        lat: reportData.location.lat,
        lng: reportData.location.lng,
        municipality: municipality,
        barangay: reportData.location.barangay || '',
        street: reportData.location.street || '',
        accuracy: reportData.location.accuracy || 0
      },
      disaster: {
        type: reportData.disaster.type,
        severity: reportData.disaster.severity,
        description: reportData.disaster.description,
        tags: reportData.disaster.tags || [],
        ...reportData.disaster.extraFields
      },
      media: {
        photos: photoUrls,
        videos: [],
        thumbnails: thumbnailUrls
      },
      reporter: {
        userId: user?.uid || 'anonymous',
        name: user?.displayName || 'Anonymous',
        isAnonymous: !user,
        isVerifiedUser: false
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
          resourcesUsed: ''
        }
      },
      engagement: {
        views: 0,
        upvotes: 0,
        upvotedBy: [],
        commentCount: 0,
        shares: 0
      },
      weatherContext
    };

    const docRef = await addDoc(collection(db, 'reports'), report);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
}

export async function upvoteReport(reportId, userId) {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    'engagement.upvotes': increment(1),
    'engagement.upvotedBy': arrayUnion(userId)
  });
}

export async function removeUpvote(reportId, userId) {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    'engagement.upvotes': increment(-1),
    'engagement.upvotedBy': arrayRemove(userId)
  });
}

export async function verifyReport(reportId, adminId, adminRole, notes = '') {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    'verification.status': 'verified',
    'verification.verifiedBy': adminId,
    'verification.verifiedAt': serverTimestamp(),
    'verification.verifierRole': adminRole,
    'verification.notes': notes
  });
}

export async function rejectReport(reportId, adminId, adminRole, notes = '') {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    'verification.status': 'rejected',
    'verification.verifiedBy': adminId,
    'verification.verifiedAt': serverTimestamp(),
    'verification.verifierRole': adminRole,
    'verification.notes': notes
  });
}

export async function resolveReport(reportId, adminId, evidencePhotos, actionsTaken, resolutionNotes = '', resourcesUsed = '') {
  // Upload evidence photos
  const evidenceUrls = [];
  for (const photo of evidencePhotos) {
    const compressed = await compressImage(photo);
    const photoRef = ref(storage, `evidence/${Date.now()}_${photo.name}`);
    await uploadBytes(photoRef, compressed);
    const url = await getDownloadURL(photoRef);
    evidenceUrls.push(url);
  }

  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    'verification.status': 'resolved',
    'verification.resolution.resolvedBy': adminId,
    'verification.resolution.resolvedAt': serverTimestamp(),
    'verification.resolution.evidencePhotos': evidenceUrls,
    'verification.resolution.actionsTaken': actionsTaken,
    'verification.resolution.resolutionNotes': resolutionNotes,
    'verification.resolution.resourcesUsed': resourcesUsed
  });
}

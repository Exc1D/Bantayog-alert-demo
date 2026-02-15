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
  deleteDoc,
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

export async function submitReport(reportData, evidenceFiles, user) {
  // Detect municipality (sync, run first)
  const municipality = detectMunicipality(
    reportData.location.lat,
    reportData.location.lng
  ) || reportData.location.municipality || 'Unknown';

  // Separate images and videos
  const imageFiles = evidenceFiles.filter(f => f.type.startsWith('image/'));
  const videoFiles = evidenceFiles.filter(f => f.type.startsWith('video/'));

  // Start all three groups in parallel; each file fails independently
  const imageResultsPromise = Promise.all(
    imageFiles.map(async (photo, index) => {
      try {
        const [compressed, thumbnail] = await Promise.all([
          compressImage(photo),
          createThumbnail(photo)
        ]);

        const ts = Date.now() + index;
        const photoRef = ref(storage, `reports/${ts}_${photo.name}`);
        const thumbRef = ref(storage, `reports/thumbs/${ts}_${photo.name}`);

        await Promise.all([
          uploadBytes(photoRef, compressed),
          uploadBytes(thumbRef, thumbnail)
        ]);

        const [photoUrl, thumbUrl] = await Promise.all([
          getDownloadURL(photoRef),
          getDownloadURL(thumbRef)
        ]);

        return { photoUrl, thumbUrl };
      } catch (err) {
        console.warn('Image upload failed, skipping:', photo.name, err);
        return null;
      }
    })
  );

  const videoUrlsPromise = Promise.all(
    videoFiles.map(async (video, index) => {
      try {
        const ts = Date.now() + index;
        const videoRef = ref(storage, `reports/videos/${ts}_${video.name}`);
        await uploadBytes(videoRef, video);
        return await getDownloadURL(videoRef);
      } catch (err) {
        console.warn('Video upload failed, skipping:', video.name, err);
        return null;
      }
    })
  );

  // Weather fetch runs in parallel with uploads; errors fall back to {}
  const weatherContextPromise = fetchCurrentWeather(
    reportData.location.lat,
    reportData.location.lng
  ).catch((e) => {
    console.warn('Could not fetch weather context:', e);
    return {};
  });

  const [imageResults, videoUrls, weatherContext] = await Promise.all([
    imageResultsPromise,
    videoUrlsPromise,
    weatherContextPromise,
  ]);

  // Filter out failed uploads and surface a summary to the caller
  const successfulImages = imageResults.filter(Boolean);
  const photoUrls = successfulImages.map(r => r.photoUrl);
  const thumbnailUrls = successfulImages.map(r => r.thumbUrl);
  const successfulVideos = videoUrls.filter(Boolean);
  const skippedFiles = (imageFiles.length - successfulImages.length) +
                       (videoFiles.length - successfulVideos.length);

  // Build report document
  const report = {
    timestamp: serverTimestamp(),
    reportType: reportData.reportType || 'situation',
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
      tags: reportData.disaster.tags || []
    },
    media: {
      photos: photoUrls,
      videos: successfulVideos,
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
  return { id: docRef.id, skippedFiles };
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

export async function verifyReport(reportId, adminId, adminRole, notes = '', disasterType = null) {
  const reportRef = doc(db, 'reports', reportId);
  const updateData = {
    'verification.status': 'verified',
    'verification.verifiedBy': adminId,
    'verification.verifiedAt': serverTimestamp(),
    'verification.verifierRole': adminRole,
    'verification.notes': notes
  };

  if (disasterType) {
    updateData['disaster.type'] = disasterType;
  }

  await updateDoc(reportRef, updateData);
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
  // Upload evidence photos in parallel
  const evidenceUrls = await Promise.all(
    evidencePhotos.map(async (photo, index) => {
      const compressed = await compressImage(photo);
      const photoRef = ref(storage, `evidence/${Date.now() + index}_${photo.name}`);
      await uploadBytes(photoRef, compressed);
      return getDownloadURL(photoRef);
    })
  );

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

export async function deleteReport(reportId) {
  const reportRef = doc(db, 'reports', reportId);
  await deleteDoc(reportRef);
}

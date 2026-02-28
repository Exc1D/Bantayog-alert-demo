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
  arrayUnion,
  arrayRemove,
  runTransaction,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, serverTimestamp } from '../utils/firebaseConfig';
import { compressImage, createThumbnail } from '../utils/imageCompression';
import { fetchCurrentWeather } from '../utils/weatherAPI';
import { resolveMunicipality } from '../utils/geoFencing';
import { FEED_PAGE_SIZE } from '../utils/constants';
import { checkLimit, formatResetTime } from '../utils/rateLimiter';
import { logAuditEvent, AuditEvent, AuditEventType } from '../utils/auditLogger';

const ADMIN_ROLES = ['superadmin_provincial'];

function isAdminRole(role = '') {
  return ADMIN_ROLES.includes(role) || role.startsWith('admin_') || role.endsWith('_admin');
}

function safeFileName(name = '') {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
}

export function useReports(filters = {}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    let q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'), limit(FEED_PAGE_SIZE));

    if (filters.municipality && filters.municipality !== 'all') {
      q = query(
        collection(db, 'reports'),
        where('location.municipality', '==', filters.municipality),
        orderBy('timestamp', 'desc'),
        limit(FEED_PAGE_SIZE)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        setReports(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length >= FEED_PAGE_SIZE);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters.municipality]);

  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;

    try {
      const constraints = [
        collection(db, 'reports'),
        ...(filters.municipality && filters.municipality !== 'all'
          ? [where('location.municipality', '==', filters.municipality)]
          : []),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(FEED_PAGE_SIZE),
      ];

      const q = query(...constraints);

      const snapshot = await getDocs(q);
      const newDocs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));

      setReports((prev) => [...prev, ...newDocs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length >= FEED_PAGE_SIZE);
    } catch (err) {
      setError(err?.message ?? 'Failed to load more reports');
    }
  }, [lastDoc, hasMore, filters.municipality]);

  return { reports, loading, error, loadMore, hasMore };
}

export async function submitReport(reportData, evidenceFiles, user) {
  if (!user?.uid) {
    throw new Error('Authentication required to submit reports. Please sign in and try again.');
  }

  const rateLimitStatus = checkLimit('report_submission');
  if (!rateLimitStatus.allowed) {
    const error = new Error(
      `Rate limit exceeded. Please wait ${formatResetTime(rateLimitStatus.resetTime)} before submitting another report.`
    );
    error.code = 'rate_limited';
    error.resetTime = rateLimitStatus.resetTime;
    throw error;
  }

  // Detect municipality (sync, run first)
  const resolved = resolveMunicipality(
    reportData.location.lat,
    reportData.location.lng,
    reportData.location.municipality || 'Unknown'
  );
  const municipality = resolved.municipality;
  const municipalityDetectionMethod = resolved.method;

  // Separate images and videos
  const imageFiles = evidenceFiles.filter((f) => f.type.startsWith('image/'));
  const videoFiles = evidenceFiles.filter((f) => f.type.startsWith('video/'));

  // Start all three groups in parallel; each file fails independently
  const imageResultsPromise = Promise.all(
    imageFiles.map(async (photo, index) => {
      try {
        const [compressed, thumbnail] = await Promise.all([
          compressImage(photo),
          createThumbnail(photo),
        ]);

        const ts = Date.now() + index;
        const safeName = safeFileName(photo.name);
        const photoRef = ref(storage, `reports/${ts}_${safeName}`);
        const thumbRef = ref(storage, `reports/thumbs/${ts}_${safeName}`);

        await Promise.all([uploadBytes(photoRef, compressed), uploadBytes(thumbRef, thumbnail)]);

        const [photoUrl, thumbUrl] = await Promise.all([
          getDownloadURL(photoRef),
          getDownloadURL(thumbRef),
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
        const safeName = safeFileName(video.name);
        const videoRef = ref(storage, `reports/videos/${ts}_${safeName}`);
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
  const photoUrls = successfulImages.map((r) => r.photoUrl);
  const thumbnailUrls = successfulImages.map((r) => r.thumbUrl);
  const successfulVideos = videoUrls.filter(Boolean);
  const skippedFiles =
    imageFiles.length - successfulImages.length + (videoFiles.length - successfulVideos.length);

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
      accuracy: reportData.location.accuracy || 0,
      municipalityDetectionMethod,
    },
    disaster: {
      type: reportData.disaster.type,
      severity: reportData.disaster.severity,
      description: reportData.disaster.description,
      tags: reportData.disaster.tags || [],
    },
    media: {
      photos: photoUrls,
      videos: successfulVideos,
      thumbnails: thumbnailUrls,
    },
    reporter: {
      userId: user.uid,
      name: user.displayName || 'Anonymous',
      isAnonymous: user.isAnonymous ?? false,
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
      views: 0,
      upvotes: 0,
      upvotedBy: [],
      commentCount: 0,
      shares: 0,
    },
    weatherContext,
  };

  const docRef = await addDoc(collection(db, 'reports'), report);

  logAuditEvent(
    new AuditEvent({
      eventType: AuditEventType.REPORT_CREATE,
      userId: user.uid,
      userEmail: user.email || null,
      targetType: 'report',
      targetId: docRef.id,
      metadata: {
        reportType: reportData.reportType || 'situation',
        disasterType: reportData.disaster?.type,
        severity: reportData.disaster?.severity,
        municipality,
      },
    })
  );

  return { id: docRef.id, skippedFiles };
}

export async function upvoteReport(reportId, userId) {
  if (!userId) throw new Error('Authentication required to upvote.');

  const reportRef = doc(db, 'reports', reportId);
  await runTransaction(db, async (transaction) => {
    const reportDoc = await transaction.get(reportRef);
    if (!reportDoc.exists()) throw new Error('Report not found.');

    const engagement = reportDoc.data().engagement || {};
    const upvotedBy = engagement.upvotedBy || [];

    if (upvotedBy.includes(userId)) return;

    transaction.update(reportRef, {
      'engagement.upvotes': (engagement.upvotes || 0) + 1,
      'engagement.upvotedBy': arrayUnion(userId),
    });
  });
}

export async function removeUpvote(reportId, userId) {
  if (!userId) throw new Error('Authentication required to remove upvote.');

  const reportRef = doc(db, 'reports', reportId);
  await runTransaction(db, async (transaction) => {
    const reportDoc = await transaction.get(reportRef);
    if (!reportDoc.exists()) throw new Error('Report not found.');

    const engagement = reportDoc.data().engagement || {};
    const upvotedBy = engagement.upvotedBy || [];

    if (!upvotedBy.includes(userId)) return;

    transaction.update(reportRef, {
      'engagement.upvotes': Math.max((engagement.upvotes || 0) - 1, 0),
      'engagement.upvotedBy': arrayRemove(userId),
    });
  });
}

export async function verifyReport(
  reportId,
  adminId,
  adminRole,
  notes = '',
  disasterType = null,
  severity = null
) {
  if (!adminId || !isAdminRole(adminRole)) {
    throw new Error('Admin privileges required to verify reports.');
  }

  const reportRef = doc(db, 'reports', reportId);
  const updateData = {
    'verification.status': 'verified',
    'verification.verifiedBy': adminId,
    'verification.verifiedAt': serverTimestamp(),
    'verification.verifierRole': adminRole,
    'verification.notes': notes,
  };

  if (disasterType) {
    updateData['disaster.type'] = disasterType;
  }

  if (severity) {
    updateData['disaster.severity'] = severity;
  }

  await updateDoc(reportRef, updateData);
}

export async function rejectReport(reportId, adminId, adminRole, notes = '') {
  if (!adminId || !isAdminRole(adminRole)) {
    throw new Error('Admin privileges required to reject reports.');
  }

  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    'verification.status': 'rejected',
    'verification.verifiedBy': adminId,
    'verification.verifiedAt': serverTimestamp(),
    'verification.verifierRole': adminRole,
    'verification.notes': notes,
  });
}

export async function resolveReport(
  reportId,
  adminId,
  evidencePhotos,
  actionsTaken,
  resolutionNotes = '',
  resourcesUsed = '',
  adminRole = ''
) {
  if (!adminId || !isAdminRole(adminRole)) {
    throw new Error('Admin privileges required to resolve reports.');
  }

  // Upload evidence photos in parallel
  const evidenceUrls = await Promise.all(
    evidencePhotos.map(async (photo, index) => {
      const compressed = await compressImage(photo);
      const safeName = safeFileName(photo.name);
      const photoRef = ref(storage, `evidence/${Date.now() + index}_${safeName}`);
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
    'verification.resolution.resourcesUsed': resourcesUsed,
  });
}

export async function deleteReport(reportId, adminRole = '', adminId = null) {
  if (!isAdminRole(adminRole)) {
    throw new Error('Admin privileges required to delete reports.');
  }

  logAuditEvent(
    new AuditEvent({
      eventType: AuditEventType.REPORT_DELETE,
      userId: adminId,
      userRole: adminRole,
      targetType: 'report',
      targetId: reportId,
      metadata: { action: 'report_deleted_by_admin', adminRole },
    })
  );

  const reportRef = doc(db, 'reports', reportId);
  await deleteDoc(reportRef);
}

export function getReportSubmissionRateLimit() {
  return checkLimit('report_submission');
}

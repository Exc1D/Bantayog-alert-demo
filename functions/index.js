const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

const RATE_LIMITS = {
  report_submission: { maxAttempts: 10, windowSeconds: 3600 },
  report_update: { maxAttempts: 20, windowSeconds: 3600 },
  image_upload: { maxAttempts: 30, windowSeconds: 3600 },
  comment: { maxAttempts: 50, windowSeconds: 3600 },
  api_call: { maxAttempts: 100, windowSeconds: 60 },
};

async function checkRateLimit(userId, actionType) {
  const config = RATE_LIMITS[actionType];
  if (!config) {
    return { allowed: true, remaining: Infinity };
  }

  const now = admin.firestore.Timestamp.now();
  const windowStart = new admin.firestore.Timestamp(now.seconds - config.windowSeconds, 0);

  const rateLimitRef = db
    .collection('rateLimits')
    .doc(userId)
    .collection('actions')
    .doc(actionType);
  const doc = await rateLimitRef.get();

  if (!doc.exists) {
    await rateLimitRef.set({
      attempts: 1,
      windowStart: now,
      lastAttempt: now,
    });
    return { allowed: true, remaining: config.maxAttempts - 1 };
  }

  const data = doc.data();
  const windowStartTime = data.windowStart.toDate();
  const windowStartTimestamp = admin.firestore.Timestamp.fromDate(windowStartTime);

  if (windowStartTimestamp.seconds < windowStart.seconds) {
    await rateLimitRef.set({
      attempts: 1,
      windowStart: now,
      lastAttempt: now,
    });
    return { allowed: true, remaining: config.maxAttempts - 1 };
  }

  if (data.attempts >= config.maxAttempts) {
    const resetTime = (windowStartTimestamp.seconds + config.windowSeconds - now.seconds) * 1000;
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.max(0, resetTime),
      maxAttempts: config.maxAttempts,
    };
  }

  await rateLimitRef.update({
    attempts: admin.firestore.FieldValue.increment(1),
    lastAttempt: now,
  });

  return {
    allowed: true,
    remaining: config.maxAttempts - data.attempts - 1,
    maxAttempts: config.maxAttempts,
  };
}

exports.checkRateLimit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { actionType } = data;
  const userId = context.auth.uid;

  if (!actionType || !RATE_LIMITS[actionType]) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid action type');
  }

  const result = await checkRateLimit(userId, actionType);
  return result;
});

exports.submitReportWithRateLimit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const userId = context.auth.uid;
  const rateLimitResult = await checkRateLimit(userId, 'report_submission');

  if (!rateLimitResult.allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded', {
      resetTime: rateLimitResult.resetTime,
    });
  }

  return { allowed: true, remaining: rateLimitResult.remaining };
});

const notifications = require('./notifications');

exports.subscribeToTopic = notifications.subscribeToTopic;
exports.unsubscribeFromTopic = notifications.unsubscribeFromTopic;
exports.sendReportNotification = notifications.sendReportNotification;
exports.sendVerificationNotification = notifications.sendVerificationNotification;
exports.sendAlertToAll = notifications.sendAlertToAll;

exports.cleanupOldRateLimits = functions.pubsub.schedule('0 * * * *').onRun(async () => {
  const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

  const usersSnapshot = await db.collection('rateLimits').get();

  const batch = db.batch();
  let deleteCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    const actionsSnapshot = await userDoc.ref.collection('actions').get();

    for (const actionDoc of actionsSnapshot.docs) {
      const data = actionDoc.data();
      if (data.windowStart && data.windowStart.toMillis() < cutoff.toMillis()) {
        batch.delete(actionDoc.ref);
        deleteCount++;
      }
    }
  }

  if (deleteCount > 0) {
    await batch.commit();
  }

  console.log(`Cleaned up ${deleteCount} old rate limit entries`);
  return null;
});

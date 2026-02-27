const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

exports.subscribeToTopic = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { token, topic } = data;

  if (!token || !topic) {
    throw new functions.https.HttpsError('invalid-argument', 'Token and topic are required');
  }

  try {
    await admin.messaging().subscribeToTopic(token, topic);

    const userId = context.auth.uid;
    await db.collection('users').doc(userId).collection('subscriptions').doc(topic).set({
      token,
      topic,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, topic };
  } catch (error) {
    console.error('Failed to subscribe to topic:', error);
    throw new functions.https.HttpsError('internal', 'Failed to subscribe to notifications');
  }
});

exports.unsubscribeFromTopic = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { token, topic } = data;

  if (!token || !topic) {
    throw new functions.https.HttpsError('invalid-argument', 'Token and topic are required');
  }

  try {
    await admin.messaging().unsubscribeFromTopic(token, topic);

    const userId = context.auth.uid;
    await db.collection('users').doc(userId).collection('subscriptions').doc(topic).delete();

    return { success: true, topic };
  } catch (error) {
    console.error('Failed to unsubscribe from topic:', error);
    throw new functions.https.HttpsError('internal', 'Failed to unsubscribe from notifications');
  }
});

exports.sendReportNotification = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const report = snap.data();
    const reportId = context.params.reportId;

    if (!report || !report.location || !report.location.municipality) {
      console.log('Report missing location data, skipping notification');
      return null;
    }

    const municipality = report.location.municipality;
    const disasterType = report.disaster?.type || 'unknown';
    const severity = report.disaster?.severity || 'unknown';

    const topic = `municipality_${municipality.toLowerCase().replace(/\s+/g, '_')}`;

    const notification = {
      notification: {
        title: `New ${disasterType} Report in ${municipality}`,
        body: `Severity: ${severity}. ${report.disaster?.description?.substring(0, 100) || 'Tap to view details.'}`,
      },
      data: {
        reportId: reportId,
        type: 'new_report',
        municipality: municipality,
        disasterType: disasterType,
        severity: severity,
        url: `/#map?report=${reportId}`,
      },
      android: {
        notification: {
          channelId: 'reports',
          priority: severity === 'critical' ? 'max' : 'high',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      topic: topic,
    };

    try {
      await admin.messaging().send(notification);
      console.log(`Notification sent to topic: ${topic}`);
      return null;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  });

exports.sendVerificationNotification = functions.firestore
  .document('reports/{reportId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const reportId = context.params.reportId;

    if (beforeData.verification?.status === afterData.verification?.status) {
      return null;
    }

    const reporterId = afterData.reporter?.userId;
    if (!reporterId || afterData.reporter?.isAnonymous) {
      return null;
    }

    const status = afterData.verification?.status;
    let title, body;

    switch (status) {
      case 'verified':
        title = 'Report Verified';
        body = 'Your report has been verified by authorities.';
        break;
      case 'rejected':
        title = 'Report Update';
        body = 'Your report has been reviewed.';
        break;
      case 'resolved':
        title = 'Report Resolved';
        body = 'Your report has been marked as resolved.';
        break;
      default:
        return null;
    }

    const userDoc = await db.collection('users').doc(reporterId).get();
    if (!userDoc.exists) {
      return null;
    }

    const subscriptionsSnapshot = await db
      .collection('users')
      .doc(reporterId)
      .collection('subscriptions')
      .get();

    const tokens = subscriptionsSnapshot.docs.map((doc) => doc.data().token).filter(Boolean);

    if (tokens.length === 0) {
      return null;
    }

    const messages = tokens.map((token) => ({
      notification: { title, body },
      data: {
        reportId: reportId,
        type: 'verification_update',
        status: status,
        url: `/#feed?report=${reportId}`,
      },
      android: {
        notification: {
          channelId: 'updates',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      token: token,
    }));

    try {
      await admin.messaging().sendEach(messages);
      console.log(`Verification notification sent to reporter: ${reporterId}`);
      return null;
    } catch (error) {
      console.error('Failed to send verification notification:', error);
      return null;
    }
  });

exports.sendAlertToAll = functions.https.onCall(async (data, context) => {
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (!userRole || (!userRole.startsWith('admin_') && userRole !== 'superadmin_provincial')) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { title, body, municipality } = data;

  if (!title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'Title and body are required');
  }

  const topic = municipality
    ? `municipality_${municipality.toLowerCase().replace(/\s+/g, '_')}`
    : 'all_users';

  const notification = {
    notification: { title, body },
    data: {
      type: 'admin_alert',
      url: '/#feed',
    },
    android: {
      notification: {
        channelId: 'alerts',
        priority: 'max',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    topic: topic,
  };

  try {
    const messageId = await admin.messaging().send(notification);
    return { success: true, messageId };
  } catch (error) {
    console.error('Failed to send alert:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send alert');
  }
});

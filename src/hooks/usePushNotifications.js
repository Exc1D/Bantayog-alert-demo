import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { app, getMessagingInstance, isMessagingSupported } from '../utils/firebaseConfig';
import { captureException } from '../utils/sentry';

const functions = getFunctions(app, 'us-central1');

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
  return Notification.permission;
}

function checkPushSupport() {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export function usePushNotifications() {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(getNotificationPermission);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkSupport = async () => {
      const browserSupported = checkPushSupport();
      if (!browserSupported) {
        if (mounted) setIsSupported(false);
        return;
      }

      const messagingSupported = await isMessagingSupported();
      if (mounted) setIsSupported(messagingSupported);
    };

    checkSupport();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let unsubscribe;

    const setupMessageListener = async () => {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        const { notification, data } = payload;

        if (notification && Notification.permission === 'granted') {
          const notificationOptions = {
            body: notification.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: data,
            tag: data?.tag || 'general',
          };

          new Notification(notification.title, notificationOptions);
        }
      });
    };

    if (isSupported) {
      setupMessageListener();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return null;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setError('Notification permission denied');
        return null;
      }

      const messaging = await getMessagingInstance();
      if (!messaging) {
        setError('Messaging is not supported');
        return null;
      }

      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (currentToken) {
        setToken(currentToken);
        return currentToken;
      } else {
        setError('Failed to get registration token');
        return null;
      }
    } catch (err) {
      captureException(err, {
        tags: { component: 'usePushNotifications', action: 'requestPermission' },
      });
      setError(err.message);
      return null;
    }
  }, [isSupported]);

  const subscribeToTopic = useCallback(
    async (topic) => {
      if (!token) {
        const newToken = await requestPermission();
        if (!newToken) return false;
      }

      try {
        const subscribeFn = httpsCallable(functions, 'subscribeToTopic');
        const messaging = await getMessagingInstance();

        let effectiveToken = token;
        if (!effectiveToken && messaging) {
          effectiveToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        }

        await subscribeFn({
          token: effectiveToken,
          topic,
        });
        return true;
      } catch (err) {
        captureException(err, {
          tags: { component: 'usePushNotifications', action: 'subscribeToTopic' },
        });
        setError(err.message);
        return false;
      }
    },
    [token, requestPermission]
  );

  const unsubscribeFromTopic = useCallback(
    async (topic) => {
      if (!token) return false;

      try {
        const unsubscribeFn = httpsCallable(functions, 'unsubscribeFromTopic');
        await unsubscribeFn({ token, topic });
        return true;
      } catch (err) {
        captureException(err, {
          tags: { component: 'usePushNotifications', action: 'unsubscribeFromTopic' },
        });
        setError(err.message);
        return false;
      }
    },
    [token]
  );

  const unsubscribeAll = useCallback(async () => {
    try {
      const messaging = await getMessagingInstance();
      if (messaging) {
        await deleteToken(messaging);
      }
      setToken(null);
      return true;
    } catch (err) {
      captureException(err, {
        tags: { component: 'usePushNotifications', action: 'unsubscribeAll' },
      });
      setError(err.message);
      return false;
    }
  }, []);

  return {
    token,
    permission,
    isSupported,
    error,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    unsubscribeAll,
  };
}

export default usePushNotifications;

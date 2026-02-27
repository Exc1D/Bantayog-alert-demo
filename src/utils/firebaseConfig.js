import { initializeApp } from 'firebase/app';
import { serverTimestamp, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { getMessaging, isSupported } from 'firebase/messaging';
import { firebaseConfig } from '../config';

function validateFirebaseConfig() {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];
  const missing = requiredKeys.filter(
    (key) => !firebaseConfig[key] || firebaseConfig[key].includes('YOUR_')
  );

  if (missing.length > 0) {
    const message =
      `Invalid Firebase configuration. Missing or placeholder values for: ${missing.join(', ')}. ` +
      'Please update your environment variables.';
    if (import.meta.env.VITE_APP_ENV === 'production') {
      throw new Error(message);
    }
    console.warn(message);
  }
}

validateFirebaseConfig();

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

const firebaseRemoteConfig = getRemoteConfig(app);
firebaseRemoteConfig.settings.minimumFetchIntervalMillis = 3600000;

let messagingInstance = null;
let messagingSupported = null;

/**
 * Lazily initializes and returns the Firebase Messaging instance.
 * Returns null if messaging is not supported in the current environment.
 * @returns {Promise<object|null>}
 */
async function getMessagingInstance() {
  if (messagingSupported === null) {
    try {
      messagingSupported = await isSupported();
    } catch {
      messagingSupported = false;
    }
  }

  if (!messagingSupported) {
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }

  return messagingInstance;
}

/**
 * Checks if Firebase Messaging is supported in the current environment.
 * @returns {Promise<boolean>}
 */
async function isMessagingSupported() {
  if (messagingSupported === null) {
    try {
      messagingSupported = await isSupported();
    } catch {
      messagingSupported = false;
    }
  }
  return messagingSupported;
}

export { db, serverTimestamp, getMessagingInstance, isMessagingSupported };
export const auth = getAuth(app);
export const storage = getStorage(app);
export const remoteConfig = firebaseRemoteConfig;
export default app;

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
isSupported()
  .then((supported) => {
    if (supported) {
      messagingInstance = getMessaging(app);
    }
  })
  .catch(() => {});

export { db, serverTimestamp };
export const auth = getAuth(app);
export const storage = getStorage(app);
export const remoteConfig = firebaseRemoteConfig;
export const messaging = messagingInstance;
export default app;

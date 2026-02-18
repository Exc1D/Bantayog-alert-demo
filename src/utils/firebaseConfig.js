import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
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

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { serverTimestamp };
export default app;

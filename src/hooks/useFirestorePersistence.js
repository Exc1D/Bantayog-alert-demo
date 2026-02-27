import { useEffect, useState } from 'react';
import { enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { captureException } from '../utils/sentry';

export function useFirestorePersistence() {
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const [persistenceError, setPersistenceError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const enablePersistence = async () => {
      try {
        await enableIndexedDbPersistence(db, { forceOwnership: false });
        if (mounted) {
          setPersistenceEnabled(true);
          console.log('Firestore offline persistence enabled');
        }
      } catch (err) {
        if (err.code === 'failed-precondition') {
          try {
            await enableMultiTabIndexedDbPersistence(db);
            if (mounted) {
              setPersistenceEnabled(true);
              console.log('Firestore multi-tab persistence enabled');
            }
          } catch (multiTabErr) {
            if (mounted) {
              console.warn('Firestore persistence unavailable:', multiTabErr.message);
              setPersistenceError(multiTabErr.message);
            }
          }
        } else if (err.code === 'unimplemented') {
          if (mounted) {
            console.warn('Firestore persistence not supported in this browser');
            setPersistenceError('Browser does not support offline storage');
          }
        } else {
          captureException(err, { tags: { component: 'useFirestorePersistence' } });
          if (mounted) {
            setPersistenceError(err.message);
          }
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    enablePersistence();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    persistenceEnabled,
    persistenceError,
    isInitializing,
  };
}

export default useFirestorePersistence;

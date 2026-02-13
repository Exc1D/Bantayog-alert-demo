import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseConfig';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data());
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  const signUp = async (email, password, name, municipality) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    await setDoc(doc(db, 'users', credential.user.uid), {
      userId: credential.user.uid,
      email,
      name,
      municipality: municipality || '',
      role: 'citizen',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      stats: {
        reportsSubmitted: 0,
        reportsVerified: 0,
        reportsResolved: 0,
        upvotesReceived: 0
      },
      settings: {
        notifications: true,
        shareLocation: true
      }
    });

    return credential.user;
  };

  const signInAsGuest = async () => {
    const credential = await signInAnonymously(auth);
    return credential.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = userProfile?.role?.startsWith('admin_') || userProfile?.role === 'superadmin_provincial';
  const isSuperAdmin = userProfile?.role === 'superadmin_provincial';

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
    isAdmin,
    isSuperAdmin
  };
}

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../utils/firebaseConfig';

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
      photoURL: '',
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

  const requestPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfilePicture = async (file) => {
    if (!auth.currentUser) {
      throw new Error('You must be signed in to update your profile picture.');
    }

    const avatarRef = ref(storage, `avatars/${auth.currentUser.uid}/${Date.now()}-${file.name}`);
    await uploadBytes(avatarRef, file);
    const photoURL = await getDownloadURL(avatarRef);

    await updateProfile(auth.currentUser, { photoURL });
    await setDoc(doc(db, 'users', auth.currentUser.uid), { photoURL }, { merge: true });
    setUserProfile((prev) => ({ ...(prev || {}), photoURL }));

    return photoURL;
  };

  const removeAccount = async () => {
    if (!auth.currentUser) {
      throw new Error('No signed in user found.');
    }

    const uid = auth.currentUser.uid;
    const currentPhotoURL = auth.currentUser.photoURL || userProfile?.photoURL;

    if (currentPhotoURL && currentPhotoURL.includes('/avatars%2F')) {
      try {
        const match = currentPhotoURL.match(/\/o\/(.*?)\?/);
        if (match?.[1]) {
          const storagePath = decodeURIComponent(match[1]);
          await deleteObject(ref(storage, storagePath));
        }
      } catch (error) {
        console.warn('Failed to delete profile image:', error);
      }
    }

    await deleteDoc(doc(db, 'users', uid));
    await deleteUser(auth.currentUser);
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
    requestPasswordReset,
    updateProfilePicture,
    removeAccount,
    isAdmin,
    isSuperAdmin
  };
}

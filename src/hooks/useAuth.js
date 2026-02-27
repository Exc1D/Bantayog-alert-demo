import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInAnonymously,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../utils/firebaseConfig';
import { captureException, addBreadcrumb } from '../utils/sentry';
import { getStoragePathFromUrl } from '../utils/firebaseStorage';
import { logAuditEvent, AuditEvent, AuditEventType } from '../utils/auditLogger';

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
          captureException(err, { tags: { component: 'useAuth', action: 'fetchProfile' } });
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

    logAuditEvent(
      new AuditEvent({
        eventType: AuditEventType.LOGIN,
        userId: credential.user.uid,
        userEmail: email,
        targetType: 'user',
        targetId: credential.user.uid,
        metadata: { method: 'email_password' },
      })
    );

    return credential.user;
  };

  const signUp = async (email, password, name, municipality) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    await setDoc(doc(db, 'users', credential.user.uid), {
      userId: credential.user.uid,
      email,
      displayName: name,
      photoURL: '',
      municipality: municipality || '',
      role: 'user',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      stats: {
        reportsSubmitted: 0,
        reportsVerified: 0,
        reportsResolved: 0,
        upvotesReceived: 0,
      },
      settings: {
        notifications: true,
        shareLocation: true,
        dataCollectionEnabled: true,
      },
    });

    logAuditEvent(
      new AuditEvent({
        eventType: AuditEventType.PROFILE_UPDATE,
        userId: credential.user.uid,
        userEmail: email,
        userRole: 'user',
        targetType: 'user',
        targetId: credential.user.uid,
        metadata: { action: 'account_created' },
      })
    );

    return credential.user;
  };

  const signInAsGuest = async () => {
    const credential = await signInAnonymously(auth);

    logAuditEvent(
      new AuditEvent({
        eventType: AuditEventType.LOGIN,
        userId: credential.user.uid,
        userEmail: null,
        targetType: 'user',
        targetId: credential.user.uid,
        metadata: { method: 'anonymous' },
      })
    );

    return credential.user;
  };

  const signOut = async () => {
    const currentUser = auth.currentUser;

    if (currentUser && !currentUser.isAnonymous) {
      logAuditEvent(
        new AuditEvent({
          eventType: AuditEventType.LOGOUT,
          userId: currentUser.uid,
          userEmail: currentUser.email || null,
          targetType: 'user',
          targetId: currentUser.uid,
          metadata: {},
        })
      );
    }

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

    // Delete old avatar if it exists
    const currentPhotoURL = auth.currentUser.photoURL || userProfile?.photoURL;
    if (currentPhotoURL && currentPhotoURL.includes('/avatars%2F')) {
      const storagePath = getStoragePathFromUrl(currentPhotoURL);
      if (storagePath) {
        try {
          await deleteObject(ref(storage, storagePath));
        } catch (error) {
          captureException(error, {
            tags: { component: 'useAuth', action: 'deleteOldAvatar' },
            level: 'warning',
          });
        }
      } else {
        addBreadcrumb('storage', 'Unable to extract avatar storage path from URL', 'info', {
          currentPhotoURL,
        });
      }
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
      const storagePath = getStoragePathFromUrl(currentPhotoURL);
      if (storagePath) {
        try {
          await deleteObject(ref(storage, storagePath));
        } catch (error) {
          captureException(error, {
            tags: { component: 'useAuth', action: 'deleteProfileImage' },
            level: 'warning',
          });
        }
      } else {
        addBreadcrumb('storage', 'Unable to extract avatar storage path from URL', 'info', {
          currentPhotoURL,
        });
      }
    }

    logAuditEvent(
      new AuditEvent({
        eventType: AuditEventType.DATA_DELETE,
        userId: uid,
        userEmail: userProfile?.email || auth.currentUser.email || null,
        targetType: 'user',
        targetId: uid,
        metadata: { action: 'account_deletion' },
      })
    );

    await deleteUser(auth.currentUser);
    await deleteDoc(doc(db, 'users', uid));
    setUser(null);
    setUserProfile(null);
  };

  const exportUserData = async () => {
    if (!auth.currentUser) {
      throw new Error('No signed in user found.');
    }

    logAuditEvent(
      new AuditEvent({
        eventType: AuditEventType.DATA_EXPORT,
        userId: auth.currentUser.uid,
        userEmail: userProfile?.email || auth.currentUser.email,
        targetType: 'user',
        targetId: auth.currentUser.uid,
        metadata: { action: 'user_data_export_request' },
      })
    );

    return true;
  };

  const isAdmin =
    userProfile?.role?.startsWith('admin_') || userProfile?.role === 'superadmin_provincial';
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
    exportUserData,
    isAdmin,
    isSuperAdmin,
  };
}

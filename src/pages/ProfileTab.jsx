import { useRef, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { MUNICIPALITIES } from '../utils/constants';
import Button from '../components/Common/Button';
import AdminDashboard from '../components/Admin/AdminDashboard';
import { useToast } from '../components/Common/Toast';
import PrivacySettings from '../components/Common/PrivacySettings';
import { logAuditEvent, AuditEvent, AuditEventType } from '../utils/auditLogger';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [name, setName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { signIn, signUp, signInAsGuest, requestPasswordReset } = useAuthContext();
  const { addToast } = useToast();

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setPassword('');
    setConfirmPassword('');
    setShowResetPrompt(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResetPrompt(false);

    try {
      if (isLogin) {
        await signIn(email, password);
        addToast('Signed in successfully', 'success');
      } else {
        if (!name.trim()) {
          addToast('Please enter your name', 'warning');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          addToast('Passwords do not match', 'warning');
          setLoading(false);
          return;
        }

        await signUp(email, password, name, municipality);
        addToast('Account created successfully', 'success');
      }
    } catch (error) {
      if (isLogin && error?.code === 'auth/too-many-requests') {
        setShowResetPrompt(true);
        addToast('Too many unsuccessful tries. You can reset your password below.', 'warning');
      } else {
        addToast(error.message || 'Authentication failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      addToast('Enter your email to receive a password reset link.', 'warning');
      return;
    }

    setResetLoading(true);
    try {
      await requestPasswordReset(email.trim());
      addToast('Password reset email sent. Please check your inbox.', 'success');
    } catch (error) {
      addToast(error.message || 'Unable to send password reset email.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      addToast('Signed in as guest', 'info');
    } catch {
      addToast('Guest sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white';

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl p-5 shadow-card border border-stone-100">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e63946"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <p className="text-xs text-textLight mt-1">
            {isLogin ? 'Sign in to submit hazard reports' : 'Join Bantayog Alert'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Juan dela Cruz"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
                  Municipality
                </label>
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Municipality</option>
                  {MUNICIPALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Re-enter password"
                minLength={6}
                required
              />
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-textLight cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-stone-300"
            />
            Show password
          </label>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {isLogin && showResetPrompt && (
          <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-800 mb-2">
              Too many unsuccessful login attempts were detected. You can request a password reset
              link.
            </p>
            <Button
              variant="secondary"
              onClick={handlePasswordReset}
              loading={resetLoading}
              className="w-full"
            >
              Send Password Reset Email
            </Button>
          </div>
        )}

        <div className="mt-3 text-center">
          <button
            onClick={toggleAuthMode}
            className="text-xs text-accent hover:underline font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100">
          <Button variant="ghost" onClick={handleGuest} loading={loading} className="w-full">
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserProfile() {
  const { user, userProfile, signOut, isAdmin, updateProfilePicture } = useAuthContext();
  const { addToast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed out', 'info');
    } catch {
      addToast('Sign out failed', 'error');
    }
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file.', 'warning');
      return;
    }

    setUploadingPhoto(true);
    try {
      await updateProfilePicture(file);

      logAuditEvent(
        new AuditEvent({
          eventType: AuditEventType.PROFILE_UPDATE,
          userId: user.uid,
          userEmail: user.email || null,
          targetType: 'user',
          targetId: user.uid,
          metadata: { action: 'profile_picture_updated' },
        })
      );

      addToast('Profile picture updated.', 'success');
    } catch (error) {
      addToast(error.message || 'Could not update profile picture.', 'error');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const profilePhoto = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-5 shadow-card border border-stone-100">
        <div className="flex items-center gap-3">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="User profile"
              className="w-14 h-14 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
              {(userProfile?.displayName ||
                userProfile?.name ||
                user?.displayName ||
                'U')[0].toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold truncate">
              {userProfile?.displayName ||
                userProfile?.name ||
                user?.displayName ||
                'Anonymous User'}
            </h2>
            <p className="text-xs text-textLight">{user?.email || 'Guest'}</p>
            <p className="text-[11px] text-textMuted capitalize mt-0.5">
              {userProfile?.role?.replace('_', ' ') || 'Citizen'}
              {userProfile?.municipality ? ` \u2022 ${userProfile.municipality}` : ''}
            </p>
          </div>
        </div>

        {!user?.isAnonymous && (
          <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              variant="secondary"
              onClick={handleChoosePhoto}
              loading={uploadingPhoto}
              className="w-full"
            >
              Upload Profile Picture
            </Button>
          </div>
        )}

        {userProfile?.stats && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-100">
            <div className="text-center">
              <p className="text-xl font-bold text-accent">{userProfile.stats.reportsSubmitted}</p>
              <p className="text-[10px] text-textLight uppercase tracking-wider font-semibold">
                Reports
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">
                {userProfile.stats.reportsVerified}
              </p>
              <p className="text-[10px] text-textLight uppercase tracking-wider font-semibold">
                Verified
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">
                {userProfile.stats.upvotesReceived}
              </p>
              <p className="text-[10px] text-textLight uppercase tracking-wider font-semibold">
                Upvotes
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <Button variant="secondary" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </div>

      {!user?.isAnonymous && <PrivacySettings />}

      {isAdmin && <AdminDashboard />}
    </div>
  );
}

export default function ProfileTab() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-4">
        <div className="text-center py-12">
          <p className="text-textLight text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-3 py-3 sm:px-4 sm:py-4">
      {user ? <UserProfile /> : <AuthForm />}
    </div>
  );
}

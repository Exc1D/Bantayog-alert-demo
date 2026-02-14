import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { MUNICIPALITIES } from '../utils/constants';
import Button from '../components/Common/Button';
import AdminDashboard from '../components/Admin/AdminDashboard';
import { useToast } from '../components/Common/Toast';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInAsGuest } = useAuthContext();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        await signUp(email, password, name, municipality);
        addToast('Account created successfully', 'success');
      }
    } catch (error) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      addToast('Signed in as guest', 'info');
    } catch (error) {
      addToast('Guest sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent bg-white";

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl p-5 shadow-card border border-stone-100">
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs text-textLight mt-1">
            {isLogin ? 'Sign in to submit hazard reports' : 'Join Bantayog Alert'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">Full Name</label>
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
                <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">Municipality</label>
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Municipality</option>
                  {MUNICIPALITIES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">Email</label>
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
            <label className="block text-xs font-bold text-textLight uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-3 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-accent hover:underline font-medium"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-stone-100">
          <Button
            variant="ghost"
            onClick={handleGuest}
            loading={loading}
            className="w-full"
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserProfile() {
  const { user, userProfile, signOut, isAdmin } = useAuthContext();
  const { addToast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed out', 'info');
    } catch (error) {
      addToast('Sign out failed', 'error');
    }
  };

  return (
    <div className="space-y-3">
      {/* Profile Card */}
      <div className="bg-white rounded-xl p-5 shadow-card border border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
            {(userProfile?.name || user?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">
              {userProfile?.name || user?.displayName || 'Anonymous User'}
            </h2>
            <p className="text-xs text-textLight">{user?.email || 'Guest'}</p>
            <p className="text-[11px] text-textMuted capitalize mt-0.5">
              {userProfile?.role?.replace('_', ' ') || 'Citizen'}
              {userProfile?.municipality ? ` \u2022 ${userProfile.municipality}` : ''}
            </p>
          </div>
        </div>

        {/* Stats */}
        {userProfile?.stats && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-100">
            <div className="text-center">
              <p className="text-xl font-bold text-accent">{userProfile.stats.reportsSubmitted}</p>
              <p className="text-[10px] text-textLight uppercase tracking-wider font-semibold">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">{userProfile.stats.reportsVerified}</p>
              <p className="text-[10px] text-textLight uppercase tracking-wider font-semibold">Verified</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">{userProfile.stats.upvotesReceived}</p>
              <p className="text-[10px] text-textLight uppercase tracking-wider font-semibold">Upvotes</p>
            </div>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={handleSignOut}
          className="w-full mt-4"
        >
          Sign Out
        </Button>
      </div>

      {/* Admin Dashboard */}
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

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

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <span className="text-4xl">{'\u{1F6E1}\uFE0F'}</span>
          <h2 className="text-xl font-bold mt-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-sm text-textLight">
            {isLogin ? 'Sign in to submit reports' : 'Join the Bantayog Alert community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
                  placeholder="Juan dela Cruz"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Municipality</label>
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
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
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-accent focus:border-accent"
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

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-accent hover:underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
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
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {(userProfile?.name || user?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {userProfile?.name || user?.displayName || 'Anonymous User'}
            </h2>
            <p className="text-sm text-textLight">{user?.email || 'Guest'}</p>
            <p className="text-xs text-textLight capitalize mt-0.5">
              {userProfile?.role?.replace('_', ' ') || 'Citizen'}
              {userProfile?.municipality ? ` \u2022 ${userProfile.municipality}` : ''}
            </p>
          </div>
        </div>

        {/* Stats */}
        {userProfile?.stats && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{userProfile.stats.reportsSubmitted}</p>
              <p className="text-xs text-textLight">Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{userProfile.stats.reportsVerified}</p>
              <p className="text-xs text-textLight">Verified</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{userProfile.stats.upvotesReceived}</p>
              <p className="text-xs text-textLight">Upvotes</p>
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
          <p className="text-textLight">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 py-4">
      {user ? <UserProfile /> : <AuthForm />}
    </div>
  );
}

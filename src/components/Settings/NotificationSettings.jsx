import { useState, useEffect } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { MUNICIPALITIES } from '../../utils/constants';
import { useToast } from '../Common/Toast';

export default function NotificationSettings() {
  const {
    token,
    permission,
    isSupported,
    requestPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
  } = usePushNotifications();
  const { addToast } = useToast();
  const [subscriptions, setSubscriptions] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('notification-subscriptions');
      if (stored) {
        setSubscriptions(new Set(JSON.parse(stored)));
      }
    }
  }, [token]);

  const handleToggleMunicipality = async (municipality) => {
    setLoading(true);
    const topic = `municipality_${municipality.toLowerCase().replace(/\s+/g, '_')}`;
    const isSubscribed = subscriptions.has(municipality);

    try {
      if (isSubscribed) {
        const success = await unsubscribeFromTopic(topic);
        if (success) {
          const newSubs = new Set(subscriptions);
          newSubs.delete(municipality);
          setSubscriptions(newSubs);
          localStorage.setItem('notification-subscriptions', JSON.stringify([...newSubs]));
          addToast(`Unsubscribed from ${municipality} alerts`, 'info');
        }
      } else {
        const success = await subscribeToTopic(topic);
        if (success) {
          const newSubs = new Set(subscriptions);
          newSubs.add(municipality);
          setSubscriptions(newSubs);
          localStorage.setItem('notification-subscriptions', JSON.stringify([...newSubs]));
          addToast(`Subscribed to ${municipality} alerts`, 'success');
        }
      }
    } catch (_err) {
      addToast('Failed to update notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const newToken = await requestPermission();
      if (newToken) {
        addToast('Notifications enabled successfully', 'success');
      }
    } catch (_err) {
      addToast('Failed to enable notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  if (permission !== 'granted') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get alerts about new reports and updates in your area
            </p>
          </div>
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
        {permission === 'denied' && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm text-green-700 dark:text-green-300">Notifications enabled</span>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Subscribe to municipality alerts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MUNICIPALITIES.map((municipality) => (
            <label
              key={municipality}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                subscriptions.has(municipality)
                  ? 'bg-primary/10 border border-primary'
                  : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={subscriptions.has(municipality)}
                onChange={() => handleToggleMunicipality(municipality)}
                disabled={loading}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{municipality}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        You&apos;ll receive notifications for new disaster reports in subscribed municipalities.
      </p>
    </div>
  );
}

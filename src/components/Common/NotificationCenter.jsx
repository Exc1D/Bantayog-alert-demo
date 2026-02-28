import { useEffect, memo, useMemo } from 'react';

function NotificationItem({ notification, onMarkRead }) {
  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        );
      case 'verified':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case 'resolved':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-stone-600 dark:text-stone-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
        );
    }
  };

  const timeAgo = useMemo(() => {
    return (timestamp) => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    };
  }, []);

  return (
    <div
      className={`p-3 border-b border-stone-100 dark:border-dark-border hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${
        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        {getIcon(notification.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text dark:text-dark-text truncate">
            {notification.title}
          </p>
          <p className="text-xs text-textLight dark:text-dark-textLight mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-textMuted dark:text-dark-textMuted mt-1">
            {timeAgo(notification.timestamp)}
          </p>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkRead?.(notification.id)}
            className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"
            aria-label="Mark as read"
          />
        )}
      </div>
    </div>
  );
}

const NotificationCenter = memo(function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-stone-200 dark:border-dark-border overflow-hidden z-50 animate-slide-down">
      <div className="flex items-center justify-between p-3 border-b border-stone-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-text dark:text-dark-text">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-textLight dark:text-dark-textLight hover:text-accent px-2 py-1"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
            aria-label="Close notifications"
          >
            <svg
              className="w-4 h-4 text-textLight"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-textMuted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <p className="text-sm text-textLight dark:text-dark-textLight">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>
    </div>
  );
});

function NotificationBell({ notifications = [], onToggle }) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      </button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}

export { NotificationCenter, NotificationBell };
export default NotificationCenter;

import { useState, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: { bg: 'bg-emerald-600', icon: '\u2705' },
  error: { bg: 'bg-red-600', icon: '\u274C' },
  warning: { bg: 'bg-amber-600', icon: '\u26A0\uFE0F' },
  info: { bg: 'bg-primary', icon: '\u2139\uFE0F' }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
          return (
            <div
              key={toast.id}
              className={`${config.bg} text-white px-4 py-3 rounded-lg shadow-dark flex items-center gap-2.5 min-w-[280px] max-w-[360px] pointer-events-auto animate-slide-up`}
            >
              <span className="text-base">{config.icon}</span>
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white text-lg leading-none ml-1"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

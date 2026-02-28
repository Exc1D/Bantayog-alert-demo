import { useEffect, useCallback, memo } from 'react';

const ConfirmDialog = memo(function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false,
}) {
  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        handleCancel();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, isLoading, handleCancel]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    warning: {
      button: 'bg-amber-500 hover:bg-amber-600 text-white',
      icon: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    primary: {
      button: 'bg-accent hover:bg-accentDark text-white',
      icon: 'text-accent',
      bg: 'bg-accent/5',
    },
    success: {
      button: 'bg-green-600 hover:bg-green-700 text-white',
      icon: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? handleCancel : undefined}
        aria-hidden="true"
      />

      <div className="relative bg-white dark:bg-dark-card rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-slide-up">
        <div className={`p-6 text-center ${styles.bg}`}>
          <div
            className={`w-14 h-14 mx-auto rounded-full bg-white dark:bg-dark-card flex items-center justify-center ${styles.icon}`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {variant === 'danger' && (
                <>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </>
              )}
              {variant === 'warning' && (
                <>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </>
              )}
              {variant === 'success' && (
                <>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </>
              )}
              {variant === 'primary' && (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h3
            id="confirm-dialog-title"
            className="text-lg font-bold text-text dark:text-dark-text text-center mb-2"
          >
            {title}
          </h3>
          <p className="text-sm text-textLight dark:text-dark-textLight text-center">{message}</p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg text-sm font-semibold text-text dark:text-dark-text hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${styles.button}`}
          >
            {isLoading ? (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" />
                <path
                  className="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ConfirmDialog;

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 modal-backdrop"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-white ${maxWidth} w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-dark animate-slide-up`}>
        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-primary text-white px-5 py-3.5 flex items-center justify-between rounded-t-2xl sm:rounded-t-xl z-10">
            <h2 className="text-base font-bold tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-lg transition-colors"
            >
              &times;
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'medium' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
         className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`relative bg-white rounded-lg shadow-xl ${sizes[size]} w-full max-h-[90vh] flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="p-4 md:p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

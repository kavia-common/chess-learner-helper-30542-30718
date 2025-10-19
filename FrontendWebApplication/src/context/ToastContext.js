import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContextInstance = createContext({
  // eslint-disable-next-line no-unused-vars
  showToast: (_message, _type = 'info', _timeoutMs = 3000) => {}
});

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook to access the toast API from components. */
  return useContext(ToastContextInstance);
}

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provides a simple toast notification mechanism. */
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', timeoutMs = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (timeoutMs > 0) {
      setTimeout(() => removeToast(id), timeoutMs);
    }
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContextInstance.Provider value={value}>
      {children}
      <div className="toast-container" role="region" aria-live="polite" aria-atomic="true">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`toast toast-${type}`}
            role="status"
            onClick={() => removeToast(id)}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && removeToast(id)}
            aria-label={`${type} notification: ${message}. Press Enter to dismiss.`}
          >
            {message}
          </div>
        ))}
      </div>
    </ToastContextInstance.Provider>
  );
}

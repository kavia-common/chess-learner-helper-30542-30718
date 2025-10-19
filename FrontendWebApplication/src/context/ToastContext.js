import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/common/Toast';

const ToastContextInstance = createContext({
  // PUBLIC_INTERFACE
  showToast: (_message, _type = 'info', _timeoutMs = 4000) => {},
  // PUBLIC_INTERFACE
  removeToast: (_id) => {}
});

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook to access the toast API from components. */
  return useContext(ToastContextInstance);
}

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provides a toast notification mechanism with accessible semantics. */
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', timeoutMs = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (timeoutMs > 0) {
      setTimeout(() => removeToast(id), timeoutMs);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  return (
    <ToastContextInstance.Provider value={value}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite" aria-atomic="true">
        {toasts.map(({ id, message, type }) => (
          <Toast key={id} id={id} message={message} type={type} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContextInstance.Provider>
  );
}

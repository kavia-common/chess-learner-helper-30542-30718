import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Toast system with context and simple pub/sub to trigger notifications programmatically.
 * Usage:
 *  - In App root: wrap with <ToastProvider>...</ToastProvider>
 *  - In code: useToast().show({ message: 'Saved', type: 'success' })
 *  - Or programmatically via window.__toastBus.publish({ message, type })
 */

// Types for TS-like clarity in JS: type ToastType = 'info' | 'success' | 'warning' | 'error';

const ToastContext = createContext(null);

// PUBLIC_INTERFACE
export function useToast() {
  /** Access toast methods from context. */
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

let listenerIdSeq = 0;
/** Very small event bus for programmatic triggers outside React tree if needed. */
const toastBus = {
  listeners: new Map(),
  subscribe(cb) {
    const id = ++listenerIdSeq;
    this.listeners.set(id, cb);
    return () => this.listeners.delete(id);
  },
  publish(payload) {
    this.listeners.forEach((cb) => cb(payload));
  },
};

// Expose bus for imperative usage (safe in SPA; replaceable with more robust event emitter if needed)
if (typeof window !== 'undefined') {
  // do not overwrite if already set to preserve subscriptions across HMR
  window.__toastBus = window.__toastBus || toastBus;
}

const DEFAULT_TOAST_DURATION = 4000;

function ToastItem({ id, message, type = 'info', onClose, action, duration = DEFAULT_TOAST_DURATION }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onClose(id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, onClose, duration]);

  const bg = {
    info: '#2563eb',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
  }[type] || '#374151';

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '8px',
        color: '#fff',
        backgroundColor: bg,
        boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
        minWidth: '240px',
        maxWidth: '420px',
      }}
    >
      <div style={{ flex: 1 }}>{message}</div>
      {action?.label && typeof action.onClick === 'function' && (
        <button
          onClick={() => {
            action.onClick();
            onClose(id);
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
      <button
        aria-label="Close notification"
        onClick={() => onClose(id)}
        style={{
          background: 'transparent',
          color: '#fff',
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          padding: 4,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
export function ToastProvider({ children, position = 'top-right', maxToasts = 5 }) {
  /**
   * Provides show/hide methods and renders toast list in a portal-like overlay container.
   */
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast) => {
    const id = ++idRef.current;
    setToasts((prev) => {
      const items = [{ id, ...toast }, ...prev];
      return items.slice(0, maxToasts);
    });
    return id;
  }, [maxToasts]);

  const value = useMemo(() => ({ show, remove }), [show, remove]);

  // Subscribe to global bus
  useEffect(() => {
    const unsubscribe = toastBus.subscribe((payload) => {
      if (payload?.message) show(payload);
    });
    return unsubscribe;
  }, [show]);

  // Position styles
  const containerPos = useMemo(() => {
    const base = { position: 'fixed', zIndex: 9999, display: 'flex', gap: 12, flexDirection: 'column' };
    switch (position) {
      case 'top-left':
        return { ...base, top: 16, left: 16, alignItems: 'flex-start' };
      case 'top-right':
        return { ...base, top: 16, right: 16, alignItems: 'flex-end' };
      case 'bottom-left':
        return { ...base, bottom: 16, left: 16, alignItems: 'flex-start' };
      case 'bottom-right':
        return { ...base, bottom: 16, right: 16, alignItems: 'flex-end' };
      case 'top-center':
        return { ...base, top: 16, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' };
      case 'bottom-center':
        return { ...base, bottom: 16, left: '50%', transform: 'translateX(-50%)', alignItems: 'center' };
      default:
        return { ...base, top: 16, right: 16, alignItems: 'flex-end' };
    }
  }, [position]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-relevant="additions" style={containerPos}>
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

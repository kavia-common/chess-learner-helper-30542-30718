import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * Modal
 * Accessible modal with focus trap and ESC to close.
 * Usage: <Modal isOpen onClose ariaLabel="Dialog title">...</Modal>
 */
export default function Modal({ isOpen, onClose, children, ariaLabel }) {
  const dialogRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const trapFocus = useCallback((e) => {
    if (!dialogRef.current) return;
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = dialogRef.current.querySelectorAll(focusableSelectors);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else {
        trapFocus(e);
      }
    },
    [onClose, trapFocus]
  );

  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement;
      setTimeout(() => {
        const firstButton = dialogRef.current?.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
        firstButton?.focus();
      }, 0);
      document.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      lastFocusedRef.current && lastFocusedRef.current.focus?.();
    };
  }, [isOpen, onKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        className="modal-content"
        style={{
          background: 'var(--color-surface, #fff)',
          color: 'var(--color-text, #0f172a)',
          borderRadius: 8,
          padding: '1rem',
          minWidth: '300px',
          maxWidth: '90vw',
          outline: '2px solid var(--focus-outline, #3b82f6)',
          outlineOffset: '2px',
        }}
      >
        {children}
        <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.node,
  ariaLabel: PropTypes.string.isRequired,
};

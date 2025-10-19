import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * Toast
 * A single toast item with accessible semantics and keyboard dismissal.
 */
export default function Toast({ id, message, type = 'info', onDismiss }) {
  const ref = useRef(null);
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onDismiss?.(id);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDismiss?.(id);
      }
    },
    [id, onDismiss]
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={ref}
      className={`toast toast-${type}`}
      tabIndex={0}
      role={role}
      aria-live={ariaLive}
      aria-label={`${type} notification: ${message}. Press Enter or Escape to dismiss.`}
      onClick={() => onDismiss?.(id)}
    >
      {message}
    </div>
  );
}
Toast.propTypes = {
  id: PropTypes.string,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error']),
  onDismiss: PropTypes.func,
};

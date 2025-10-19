import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * EmptyState
 * Renders a friendly empty state with icon, title, message and optional action.
 */
export default function EmptyState({ title, message, actionText, onAction, icon = '♟️', 'aria-label': ariaLabel }) {
  return (
    <section
      role="region"
      aria-label={ariaLabel || 'Empty list'}
      style={{
        border: '1px dashed var(--color-border, #cbd5e1)',
        borderRadius: 8,
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--color-muted, #475569)',
        background: 'var(--color-surface, #fff)',
      }}
    >
      <div aria-hidden="true" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        {icon}
      </div>
      <h3 style={{ margin: '0.25rem 0' }}>{title}</h3>
      <p style={{ margin: '0.25rem 0 0.75rem' }}>{message}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          aria-label={actionText}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 6,
            border: '1px solid var(--color-border, #cbd5e1)',
            background: 'var(--color-surface, #fff)',
            color: 'var(--color-text, #0f172a)',
            cursor: 'pointer',
          }}
        >
          {actionText}
        </button>
      )}
    </section>
  );
}
EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.node,
  'aria-label': PropTypes.string,
};

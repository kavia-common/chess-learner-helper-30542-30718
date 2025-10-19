import React from 'react';
import PropTypes from 'prop-types';
import './badge.css';

/**
 * PUBLIC_INTERFACE
 * Badge - a simple, accessible badge/pill to display labels like difficulty, status or categories.
 */
export default function Badge({ label, color = 'default', title, ariaLabel }) {
  // Accessible labeling: prefer ariaLabel, fallback to title or label
  const computedAria = ariaLabel || title || label;

  return (
    <span
      role="status"
      aria-label={computedAria}
      className={`clh-badge clh-badge--${color}`}
      title={title || label}
      tabIndex={0}
    >
      {label}
    </span>
  );
}

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info', 'primary', 'secondary']),
  title: PropTypes.string,
  ariaLabel: PropTypes.string
};

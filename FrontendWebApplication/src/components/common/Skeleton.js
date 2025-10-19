import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * Skeleton
 * A generic loading skeleton with accessible semantics.
 */
export default function Skeleton({ width = '100%', height = '1rem', style = {}, 'aria-label': ariaLabel }) {
  return (
    <div
      role="status"
      aria-label={ariaLabel || 'Loading content'}
      aria-live="polite"
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: '4px',
        background:
          'linear-gradient(90deg, var(--skeleton-base, #eee) 25%, var(--skeleton-highlight, #f5f5f5) 37%, var(--skeleton-base, #eee) 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-loading 1.4s ease infinite',
        ...style,
      }}
    />
  );
}
Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  'aria-label': PropTypes.string,
};

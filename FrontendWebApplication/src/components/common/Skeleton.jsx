import React from 'react';

/**
 * Skeleton placeholder lines/blocks for loading content.
 */

// PUBLIC_INTERFACE
export default function Skeleton({ width = '100%', height = 16, rounded = 8, shimmer = true, style = {} }) {
  /** Renders a skeleton block with optional shimmer effect. */
  const base = {
    width,
    height,
    borderRadius: rounded,
    background: 'linear-gradient(90deg, #e5e7eb, #f3f4f6, #e5e7eb)',
    backgroundSize: '200% 100%',
    animation: shimmer ? 'skeleton-shimmer 1.2s ease-in-out infinite' : 'none',
  };

  return (
    <div style={{ ...base, ...style }}>
      <style>
        {`@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}
      </style>
    </div>
  );
}

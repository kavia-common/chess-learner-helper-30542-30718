import React from 'react';

// PUBLIC_INTERFACE
export default function Toast({ message, type = 'info' }) {
  /** A single toast element (unused for now, present for future styling overrides). */
  return <div className={`toast toast-${type}`}>{message}</div>;
}

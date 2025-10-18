import React, { useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
export function useFocusOnMount() {
  /** Moves focus to an element when mounted for better screen reader navigation. */
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);
  return ref;
}

// PUBLIC_INTERFACE
export function HighContrastToggle({ highContrast, setHighContrast }) {
  /** Toggle for high contrast mode using data attribute. */
  return (
    <button
      style={{ position: 'absolute', top: 20, left: 20 }}
      className="btn"
      aria-pressed={highContrast}
      onClick={() => setHighContrast(v => !v)}
    >
      {highContrast ? 'High Contrast: On' : 'High Contrast: Off'}
    </button>
  );
}

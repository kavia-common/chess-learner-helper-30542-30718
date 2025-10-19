import React from 'react';

// PUBLIC_INTERFACE
export default function Timer({ running, initial = 5 * 60, onTimeout, label = 'Timer' }) {
  /** Simple countdown timer that starts/stops based on 'running'. */
  const [secs, setSecs] = React.useState(initial);

  // Reset if initial changes (e.g., on new game)
  React.useEffect(() => { setSecs(initial); }, [initial]);

  React.useEffect(() => {
    let id;
    if (running) {
      id = setInterval(() => {
        setSecs((s) => {
          if (s <= 1) {
            clearInterval(id);
            onTimeout?.();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(id);
  }, [running, onTimeout]);

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div aria-live="polite" aria-label={`${label} timer`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {label}: {mm}:{ss}
    </div>
  );
}

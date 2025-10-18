import { useEffect } from 'react';

// PUBLIC_INTERFACE
export default function useFocusTrap(containerRef, isActive) {
  /** Traps focus within a container (basic). */
  useEffect(() => {
    if (!isActive || !containerRef?.current) return;

    const container = containerRef.current;
    const selectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let focusable = Array.from(container.querySelectorAll(selectors)).filter(el => !el.hasAttribute('disabled'));

    if (focusable.length) focusable[0].focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      focusable = Array.from(container.querySelectorAll(selectors)).filter(el => !el.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [containerRef, isActive]);
}

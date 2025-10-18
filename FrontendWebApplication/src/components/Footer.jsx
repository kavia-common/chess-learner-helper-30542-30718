import React from 'react';

// PUBLIC_INTERFACE
export default function Footer() {
  /** Global footer */
  return (
    <footer role="contentinfo" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem', marginTop: '2rem' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span>© {new Date().getFullYear()} Chess Learner Helper</span>
        <nav aria-label="Footer Navigation" style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#accessibility">Accessibility</a>
        </nav>
      </div>
    </footer>
  );
}

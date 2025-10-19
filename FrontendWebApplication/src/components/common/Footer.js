import React from 'react';

// PUBLIC_INTERFACE
export default function Footer() {
  /** Global footer with minimal content. */
  return (
    <footer className="footer" role="contentinfo">
      <div>© {new Date().getFullYear()} Chess Learner Helper</div>
      <div className="footer-links">
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">React</a>
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  );
}

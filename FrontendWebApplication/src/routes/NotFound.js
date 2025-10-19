import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

// PUBLIC_INTERFACE
export default function NotFound() {
  /** Generic 404 page for undefined routes with focus management. */
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div className="not-found" role="region" aria-label="Page not found" tabIndex={-1} ref={ref}>
      <h1>404 - Not Found</h1>
      <p>The page you requested could not be found.</p>
      <Link className="btn" to={ROUTES.HOME} aria-label="Go to home page">Go Home</Link>
    </div>
  );
}

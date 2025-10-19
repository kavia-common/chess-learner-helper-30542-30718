import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

// PUBLIC_INTERFACE
export default function NotFound() {
  /** Generic 404 page for undefined routes. */
  return (
    <div className="not-found">
      <h1>404 - Not Found</h1>
      <p>The page you requested could not be found.</p>
      <Link className="btn" to={ROUTES.HOME}>Go Home</Link>
    </div>
  );
}

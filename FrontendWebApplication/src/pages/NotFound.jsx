import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * NotFound displays a friendly 404 page with a link back home.
 */
export function NotFound() {
  return (
    <section aria-labelledby="notfound-title">
      <h1 id="notfound-title">404 - Page Not Found</h1>
      <p>We couldn't find the page you were looking for.</p>
      <p><Link to="/">Go back home</Link></p>
    </section>
  );
}

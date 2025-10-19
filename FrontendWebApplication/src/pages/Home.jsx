import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Home is the landing page for the application.
 */
export function Home() {
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="title">Chess Learner Helper</h1>
      <p className="description">Welcome! Explore lessons, practice games, and challenges to improve your chess.</p>
    </section>
  );
}

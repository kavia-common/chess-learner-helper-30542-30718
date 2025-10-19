import React, { useEffect } from 'react';

/**
 * PUBLIC_INTERFACE
 * PrefetchHints injects <link rel="prefetch"> or <link rel="preload"> hints for
 * frequently visited routes to improve perceived performance without forcing downloads.
 * Adjust as needed based on analytics.
 */
export default function PrefetchHints() {
  useEffect(() => {
    const links = [
      // Adjust to chunk names if known; using routes as generic hints
      { href: '/lessons', rel: 'prefetch' },
      { href: '/games/ai', rel: 'prefetch' },
      { href: '/leaderboards', rel: 'prefetch' },
    ];
    const created = links.map(({ href, rel }) => {
      const l = document.createElement('link');
      l.setAttribute('rel', rel);
      l.setAttribute('href', href);
      document.head.appendChild(l);
      return l;
    });
    return () => {
      created.forEach((l) => l && l.parentNode && l.parentNode.removeChild(l));
    };
  }, []);

  return null;
}

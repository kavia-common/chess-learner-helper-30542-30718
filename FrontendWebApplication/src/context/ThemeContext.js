import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'clh_theme';
const CONTRAST_KEY = 'clh_high_contrast';

export const ThemeContext = createContext({
  theme: 'light',
  highContrast: false,
  toggleTheme: () => {},
  toggleContrast: () => {}
});

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  /** Provides theme and high-contrast settings with localStorage persistence. */
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored || 'light';
  });
  const [highContrast, setHighContrast] = useState(() => {
    const stored = localStorage.getItem(CONTRAST_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Apply theme and contrast to document root for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(CONTRAST_KEY, String(highContrast));
  }, [theme, highContrast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ theme, highContrast, toggleTheme, toggleContrast }),
    [theme, highContrast, toggleTheme, toggleContrast]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

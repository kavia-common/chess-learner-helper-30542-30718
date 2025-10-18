import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import RoutesIndex from './routes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { HighContrastToggle } from './accessibility/a11y';

// PUBLIC_INTERFACE
function App() {
  /** Root application component setting theme, a11y toggles, and providing routing+auth context. */
  const [theme, setTheme] = useState('light');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.dataset.contrast = highContrast ? 'high' : 'normal';
  }, [theme, highContrast]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <HighContrastToggle highContrast={highContrast} setHighContrast={setHighContrast} />

      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
            <main role="main" className="container" style={{ padding: '1rem' }}>
              <RoutesIndex />
            </main>
            <Footer />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;

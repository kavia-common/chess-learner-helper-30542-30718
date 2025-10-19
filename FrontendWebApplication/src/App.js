import React, { useEffect, useReducer } from 'react';
import './App.css';
import './styles/accessibility.css';
import { AppRouter } from './router/AppRouter';
import { Navbar } from './components/common/Navbar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import Spinner from './components/common/Spinner';
import { Suspense } from 'react';
import { StoreProvider, initialState, rootReducer, authActions } from './store';
import { LessonsProvider } from './store/lessons';
import { GamesProvider } from './store/games';
import { HistoryProvider } from './store/history';
import { GamificationProvider } from './store/gamification';
import { UserProvider } from './store/user';
import PrefetchHints from './components/common/PrefetchHints';

// PUBLIC_INTERFACE
function App() {
  /**
   * The main App component sets the global theme attribute and renders the layout:
   * - Skip link for accessibility
   * - Navbar
   * - Router outlet wrapped by ErrorBoundary
   * - LessonsProvider wraps routes to provide lessons/quiz/progress state
   * - GamesProvider provides AI/Matchmaking/Realtime state
   */
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Keep an accessible light theme by default (can be toggled later using the store)
  const theme = state.ui.theme || 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Attempt to refresh session on mount
  useEffect(() => {
    const refresh = authActions.refresh(dispatch);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StoreProvider value={{ state, dispatch }}>
      <ToastProvider>
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="App">
          <Navbar />
          <PrefetchHints />
          <main id="main" role="main" aria-live="polite" className="container" style={{ padding: '16px' }}>
            <ErrorBoundary>
              <LessonsProvider>
                <GamesProvider>
                  <HistoryProvider>
                    <GamificationProvider>
                      <UserProvider>
                        <Suspense fallback={<Spinner label="Loading..." />}>
                          <AppRouter />
                        </Suspense>
                      </UserProvider>
                    </GamificationProvider>
                  </HistoryProvider>
                </GamesProvider>
              </LessonsProvider>
            </ErrorBoundary>
          </main>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}

export default App;

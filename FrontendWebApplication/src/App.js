import React, { useEffect, useReducer } from 'react';
import './App.css';
import { AppRouter } from './router/AppRouter';
import { Navbar } from './components/common/Navbar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StoreProvider, initialState, rootReducer, authActions } from './store';
import { LessonsProvider } from './store/lessons';
import { GamesProvider } from './store/games';
import { HistoryProvider } from './store/history';

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
      <a href="#main" className="skip-link" style={{
        position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden'
      }} onFocus={(e)=>{e.currentTarget.style.left='8px'; e.currentTarget.style.top='8px'; e.currentTarget.style.width='auto'; e.currentTarget.style.height='auto'; e.currentTarget.style.padding='8px 12px'; e.currentTarget.style.background='#000'; e.currentTarget.style.color='#fff'; e.currentTarget.style.zIndex='1000';}}
      onBlur={(e)=>{e.currentTarget.style.left='-10000px'; e.currentTarget.style.width='1px'; e.currentTarget.style.height='1px';}}>Skip to content</a>
      <div className="App">
        <Navbar />
        <main id="main" role="main" className="container" style={{ padding: '16px' }}>
          <ErrorBoundary>
            <LessonsProvider>
              <GamesProvider>
                <HistoryProvider>
                  <AppRouter />
                </HistoryProvider>
              </GamesProvider>
            </LessonsProvider>
          </ErrorBoundary>
        </main>
      </div>
    </StoreProvider>
  );
}

export default App;

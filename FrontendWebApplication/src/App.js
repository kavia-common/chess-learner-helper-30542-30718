import React, { useEffect, useReducer } from 'react';
import './App.css';
import { AppRouter } from './router/AppRouter';
import { Navbar } from './components/common/Navbar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StoreProvider, initialState, rootReducer } from './store';

// PUBLIC_INTERFACE
function App() {
  /**
   * The main App component sets the global theme attribute and renders the layout:
   * - Skip link for accessibility
   * - Navbar
   * - Router outlet wrapped by ErrorBoundary
   */
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Keep an accessible light theme by default (can be toggled later using the store)
  const theme = state.ui.theme || 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
            <AppRouter />
          </ErrorBoundary>
        </main>
      </div>
    </StoreProvider>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/accessibility.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { getEnv } from './utils/env';

async function prepareApp() {
  const { useMocks, isDev } = getEnv();
  if (useMocks && isDev) {
    // Initialize MSW in browser for local development
    const { worker } = await import('./api/mock/browser');
    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
      onUnhandledRequest: 'bypass', // allow requests we don't mock
    });
    // eslint-disable-next-line no-console
    console.info('[msw] Mock Service Worker started (useMocks=true).');
  }
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

prepareApp();

/**
 * @module Main
 * @description Application entry point. Mounts the React application
 * with StoreProvider and ErrorBoundary wrapping.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ErrorBoundary } from './core/security/ErrorBoundary';
import { StoreProvider } from './core/state/StoreContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root">.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <StoreProvider>
        <App />
        <SpeedInsights />
      </StoreProvider>
    </ErrorBoundary>
  </StrictMode>
);

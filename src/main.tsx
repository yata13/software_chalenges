import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { startSyncEngine } from './store/sync';
import { watchNetlifyBadge } from './lib/netlifyBadge';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// When a new version is deployed, switch to it at once (no stale offline copy).
registerSW({ immediate: true, onRegisteredSW(_url, reg) { if (reg) setInterval(() => reg.update(), 60 * 60 * 1000); } });

startSyncEngine(); // offline-first sync between your devices
watchNetlifyBadge(); // keep our bottom buttons above Netlify's badge

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

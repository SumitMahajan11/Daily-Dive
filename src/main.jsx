import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { registerSW } from 'virtual:pwa-register';

// Auto-reload once if dynamic chunk import fails due to new deployment hashes
window.addEventListener('vite:preloadError', () => {
  const hasReloaded = sessionStorage.getItem('vite_preload_reloaded');
  if (!hasReloaded) {
    sessionStorage.setItem('vite_preload_reloaded', 'true');
    window.location.reload();
  }
});

let updateSW;

function initServiceWorker() {
  updateSW = registerSW({
    onNeedRefresh() {
      if (document.getElementById('pwa-update-toast')) return;
      const banner = document.createElement('div');
      banner.id = 'pwa-update-toast';
      banner.setAttribute('role', 'alert');
      banner.className = 'fixed bottom-20 right-4 z-50 bg-surface-container-highest border border-primary/40 text-on-surface p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs max-w-sm backdrop-blur-md';
      banner.innerHTML = `
        <div class="flex-1 font-medium">Update available — reload to get the latest features.</div>
        <button id="pwa-reload-btn" type="button" class="px-3 py-1.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer shrink-0">Reload</button>
      `;
      document.body.appendChild(banner);
      document.getElementById('pwa-reload-btn')?.addEventListener('click', () => {
        if (typeof updateSW === 'function') {
          updateSW(true);
        } else {
          window.location.reload();
        }
      });
    },
    onOfflineReady() {
      console.log('Daily Dive is cached and ready for offline use.');
    }
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    initServiceWorker();
  } else {
    window.addEventListener('load', initServiceWorker);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// Daily Dive - Service Worker
const CACHE_NAME = 'daily-dive-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/lucide@latest'
];

// Install: Cache core app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW] Pre-cache partial error (ignoring non-critical resources):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Only handle GET requests
  if (event.request.method !== 'GET') {
    return; // Pass through to network (writes require connectivity)
  }

  // 2. Supabase Topics API: Network-First with cache fallback for offline reading
  if (url.pathname.includes('/rest/v1/topics')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Network failed for topics query, serving cached topics');
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // 3. Google Fonts & CDNs: Cache-First with background revalidation
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('unpkg.com')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
          fetch(event.request).then(res => {
            if (res && res.status === 200) {
              caches.open(CACHE_NAME).then(c => c.put(event.request, res));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 4. App Shell / HTML / Local static files: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(err => {
          // If offline and request is navigation, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('/');
          }
          throw err;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

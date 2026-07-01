const CACHE_NAME = 'science-sudanese-3rd-v1';
const PRE_CACHE_RESOURCES = [
  '/',
  '/index.html'
];

// On Service Worker installation, pre-cache critical resources
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shell...');
      return cache.addAll(PRE_CACHE_RESOURCES).catch((err) => {
        console.error('[Service Worker] Pre-cache failed:', err);
      });
    })
  );
});

// Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept fetch requests and apply Cache-First with dynamic runtime caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for non-GET requests or internal API endpoints like Gemini (which can't run offline)
  if (request.method !== 'GET' || url.pathname.startsWith('/api/tutor')) {
    return;
  }

  // Handle local application routes, static assets, and third-party resources (fonts, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached file, and optionally fetch in background to refresh cache silently (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => { /* silent fallback */ });
          
        return cachedResponse;
      }

      // If not cached, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // If response is valid, dynamically store a copy in the cache for offline use
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.log('[Service Worker] Network request failed. Device is offline. Fetching fallback...');
          // Return index.html for navigation requests (SPA routing)
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          throw error;
        });
    })
  );
});

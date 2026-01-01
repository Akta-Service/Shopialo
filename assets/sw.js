// Service Worker for aggressive caching of third-party resources
// This improves cache lifetime and FCP by caching external scripts/styles

const CACHE_NAME = 'shopialo-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Resources to cache aggressively
const THIRD_PARTY_DOMAINS = [
  'cdn.hextom.com',
  'scripts.clarity.ms',
  'edge.personalizer.io',
  'script.crazyegg.com',
  'cdn.shopify.com',
  'fonts.shopifycdn.com'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - cache third-party resources
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only cache third-party resources
  const isThirdParty = THIRD_PARTY_DOMAINS.some(domain => url.hostname.includes(domain));
  
  if (!isThirdParty) {
    return; // Let browser handle first-party requests normally
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Check if cached response exists and is still fresh
        if (cachedResponse) {
          const cachedDate = new Date(cachedResponse.headers.get('date'));
          const now = new Date();
          const age = now - cachedDate;
          
          if (age < CACHE_DURATION) {
            // Return cached response if fresh
            return cachedResponse;
          }
        }
        
        // Fetch from network and cache
        return fetch(event.request).then((networkResponse) => {
          // Clone response before caching
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // Return stale cache if network fails
          return cachedResponse || new Response('Network error', { status: 408 });
        });
      });
    })
  );
});

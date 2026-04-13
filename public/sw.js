self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Bypass service worker for localhost during development to avoid interception conflicts
  if (event.request.url.includes('localhost') || event.request.url.includes('127.0.0.1')) {
    return;
  }

  // Simple pass-through for now, but satisfies PWA criteria
  event.respondWith(fetch(event.request));
});

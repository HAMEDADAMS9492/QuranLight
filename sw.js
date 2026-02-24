const CACHE_NAME = 'quranlight-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/css/theme-variables.css',
  '/assets/css/salat.css',
  '/Logo.jpg'
];

// Installation : Mise en cache des fichiers
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Stratégie : Réseau en priorité, sinon Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
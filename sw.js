/* Pocket Garage service worker — caches the landing page shell so the
   garage works offline and can be added to the home screen. */
var CACHE = 'pocket-garage-v23';
var ASSETS = [
  './',
  'index.html',
  'styles.css',
  'sw-update.js',
  'manifest.webmanifest',
  'assets/icon.svg',
  'assets/evo-wiring-90b.svg',
  'assets/carb-tune-90.svg',
  'assets/bike-log-90.svg',
  'assets/dyno-90.svg',
  'assets/speedometer-90.svg',
  'assets/timing-90.svg',
  'assets/build-sheets-90.svg',
  'assets/evo-diagnostic-90.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(ASSETS); })
  );
});

/* Update button: the waiting worker takes over only when the user taps
 * "Update available" — no install-time skipWaiting (see sw-update.js). */
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (response) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        return response;
      }).catch(function () { return cached; });
    })
  );
});

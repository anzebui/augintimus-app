/* =====================================================
   SERVICE WORKER - lets the app open even without internet.
   Strategy: always try the internet first (so updates show up right away),
   and use the saved copy only when offline.
   When you change files, you do NOT need to touch this file.
   ===================================================== */
var CACHE = 'augintimus-v1';
var CORE = ['./', 'index.html', 'css/app.css', 'css/discover.css', 'js/app.js', 'js/onboarding.js',
            'js/animals.js', 'js/discover.js', 'img/logo.png', 'manifest.webmanifest'];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      if (res.ok) caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); });
    })
  );
});

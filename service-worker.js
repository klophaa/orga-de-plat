// Service Worker — Orga de plat PWA
const CACHE_NAME = "orga-plat-v4";
const STATIC_ASSETS = ["/", "/index.html", "/static/js/main.chunk.js", "/static/css/main.chunk.css"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // Réseau d'abord pour Firebase, cache en fallback pour le reste
  if (event.request.url.includes("firebase") || event.request.url.includes("googleapis")) {
    return; // laisse Firebase gérer
  }
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

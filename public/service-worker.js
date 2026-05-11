const CACHE_NAME = "orga-de-plat-v3";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache first, then refresh the cache in the background.
// Firebase requests stay network-only for realtime data.
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("firestore.googleapis.com") ||
    event.request.url.includes("firebase") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("identitytoolkit")
  ) {
    return;
  }

  const refreshCache = fetch(event.request)
    .then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    })
    .catch(() => null);

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        event.waitUntil(refreshCache);
        return cached;
      }

      return refreshCache.then((response) => response || caches.match("/index.html"));
    })
  );
});

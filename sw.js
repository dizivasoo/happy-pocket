const CACHE_NAME = "happy-pocket-v2"; // Incremented version

const filesToCache = [
  "./",
  "./index.html",
  "./hp.css",
  "./hp.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install Event - Caching the files
self.addEventListener("install", event => {
  self.skipWaiting(); // Forces the waiting service worker to become the active one
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// Activate Event - Cleaning up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event - Offline support
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

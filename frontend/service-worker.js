const CACHE_NAME = "task-manager-v1";

const urlsToCache = [
    "/",
    "/frontend/index.html",
    "/frontend/style.css",
    "/frontend/app.js"
];

// Install
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Cache opened");
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow("/frontend/index.html")
    );
});
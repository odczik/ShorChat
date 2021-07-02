const CACHE_NAME = "data"
const urlsToCache = ["index.html", "offline.html"]

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache)
            })
    )
})

self.addEventListener("fetch", (e) => {
    
})

self.addEventListener("activate", (e) => {
    
})
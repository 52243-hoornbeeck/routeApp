const CACHE_NAME = 'hoornbeeck-route-v2';
const FILES = ['./', './index.html', './manifest.json', './offline.html', './plattegrond.png', './location-core.js'];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(
        keys.filter(key => key.startsWith('hoornbeeck-route-') && key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            const response = await fetch(event.request);
            if (response.ok) await cache.put(event.request, response.clone());
            return response;
        } catch (error) {
            const cached = await cache.match(event.request);
            if (cached) return cached;
            if (event.request.mode === 'navigate') return (await cache.match('./index.html')) || (await cache.match('./offline.html'));
            return Response.error();
        }
    })());
});

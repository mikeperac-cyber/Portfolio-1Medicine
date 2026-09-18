const CACHE = 'healthbridge-__BUILD_VERSION__';
const PRECACHE = /* __PRECACHE__ */ [];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith('healthbridge-') && key !== CACHE)
    .map((key) => caches.delete(key)))));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache prompts, submissions, feedback, telemetry, or API responses.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  if (!PRECACHE.includes(url.pathname)) return;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    if (url.pathname.startsWith('/assets/')) return (await cache.match(event.request)) || fetch(event.request);
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch { return cache.match(event.request); }
  }));
});

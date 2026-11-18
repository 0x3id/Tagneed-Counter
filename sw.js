/* =========================================================================
   El-Geish & El-Shorta Countdown — Service Worker
   Strategy: precached app shell + stale-while-revalidate for assets.
   Result: instant loads and full offline support after the first visit.
   ========================================================================= */

'use strict';

const CACHE_VERSION = 'elgeish-v1';
const CACHE_NAME = CACHE_VERSION + '-shell';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

// Core files needed to render the whole app offline.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// External origins we may opportunistically cache (non-critical for offline).
const CACHEABLE_EXTERNAL = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.tailwindcss.com'
];

// Never cache the visitor-counter endpoints — stale counts would be wrong.
const NO_CACHE_HOSTS = [
  'api.counterapi.dev',
  'api.countapi.xyz'
];

/* ---------- Install: precache the shell ---------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Add each file separately so one failure doesn't abort the whole install.
    await Promise.all(APP_SHELL.map(url => cache.add(url).catch(error => {
      console.warn('SW: failed to precache', url, error);
    })));
    await self.skipWaiting();
  })());
});

/* ---------- Activate: remove outdated caches ---------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('elgeish-') && key !== CACHE_NAME && key !== RUNTIME_CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

/* ---------- Helpers ---------- */
function shouldHandle(url) {
  if (NO_CACHE_HOSTS.some(host => url.hostname === host)) return false;
  if (url.origin === self.location.origin) return true;
  return CACHEABLE_EXTERNAL.some(host => url.hostname === host);
}

async function updateCache(request, cacheName) {
  try {
    const response = await fetch(request);
    // Opaque responses (e.g. cross-origin scripts without CORS) are cacheable too.
    if (response && (response.ok || response.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return null;
  }
}

async function staleWhileRevalidate(event) {
  const request = event.request;
  const url = new URL(request.url);
  const cacheName = url.origin === self.location.origin ? CACHE_NAME : RUNTIME_CACHE;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request).catch(() => null);

  const revalidate = updateCache(request, cacheName);

  if (cached) {
    // Serve instantly from cache, refresh quietly in the background.
    event.waitUntil(revalidate);
    return cached;
  }

  const fresh = await revalidate;
  if (fresh) return fresh;

  // Offline fallback for page navigations.
  if (request.mode === 'navigate') {
    const shell = await caches.open(CACHE_NAME);
    return (await shell.match('./index.html')) || (await shell.match('./')) || Response.error();
  }
  return Response.error();
}

/* ---------- Fetch: cache-first with background revalidation ---------- */
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (error) { return; }
  if (!shouldHandle(url)) return;

  event.respondWith(staleWhileRevalidate(event));
});

/* ---------- Allow the page to trigger an immediate update ---------- */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

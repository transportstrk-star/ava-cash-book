'use strict';
const C = 'ava-v6.2.0';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/icon-maskable-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^ava-v/.test(k) && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin || !u.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  e.respondWith((async () => {
    try {
      const r = await fetch(e.request);
      if (r.ok && r.type === 'basic') { const copy = r.clone(); e.waitUntil(caches.open(C).then(c => c.put(e.request, copy)).catch(() => {})); }
      return r;
    } catch (err) {
      const cached = await caches.match(e.request); if (cached) return cached;
      if (e.request.mode === 'navigate') { const shell = await caches.match(new URL('index.html', self.registration.scope).href); if (shell) return shell; }
      return new Response('Unavailable offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }
  })());
});
